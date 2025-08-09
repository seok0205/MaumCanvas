import { useCallback, useEffect, useRef, useState } from 'react';

// Stroke data structure
export interface Stroke {
  id: number;
  color: string;
  size: number;
  points: Float32Array; // capacity buffer
  length: number; // used floats (multiple of 2)
  composite?: GlobalCompositeOperation;
  originalLength?: number; // before simplification (if applied)
}

export interface UseFreehandCanvasOptions {
  dpr?: number; // device pixel ratio override
  snapshotInterval?: number; // create offscreen snapshot every N strokes for faster undo
  backgroundColor?: string;
  keepSinglePointStrokes?: boolean; // keep taps as dots instead of discarding
  maxSnapshots?: number; // limit stored snapshots (default 3)
  simplify?: boolean; // enable line simplification on stroke end
  simplifyTolerance?: number; // tolerance for simplification (px)
  maxPointsPerStroke?: number; // optional hard cap to prevent runaway memory
}

interface InternalSnapshot {
  strokeCount: number;
  canvas: HTMLCanvasElement;
}

export interface UseFreehandCanvasReturn {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  strokes: Stroke[];
  isDrawing: boolean;
  currentTool: 'pen' | 'eraser';
  pointerDown: (e: PointerEvent) => void; // exposed for manual binding when needed
  undo: () => void;
  redo: () => void;
  clear: () => void;
  flush: () => void; // finalize in-progress stroke
  setColor: (c: string) => void;
  setSize: (s: number) => void;
  setTool: (t: 'pen' | 'eraser') => void;
  color: string;
  size: number;
  canUndo: boolean;
  canRedo: boolean;
  redrawAll: () => void; // force full redraw (e.g. resize)
  exportPNG: (quality?: number) => Promise<Blob>;
  exportStrokes: () => string; // JSON export
  importStrokes: (json: string) => void; // JSON import (overwrites)
  metrics?: {
    frameCount: number;
    lastFrameMs: number;
    maxFrameMs: number;
    totalSegmentsDrawn: number;
  };
}

/**
 * High-performance freehand drawing hook using a single <canvas> element.
 * - Incremental stroke rendering (only new segment per rAF)
 * - Float32Array for points to reduce GC
 * - Undo/Redo with periodic offscreen snapshots
 * - Eraser via destination-out composite
 * - DPR scaling
 */
export function useFreehandCanvas(
  options: UseFreehandCanvasOptions = {}
): UseFreehandCanvasReturn {
  const {
    dpr = window.devicePixelRatio || 1,
    snapshotInterval = 8,
    backgroundColor = '#FFFFFF',
    keepSinglePointStrokes = true,
    maxSnapshots = 3,
    simplify = true,
    simplifyTolerance = 0.6,
    maxPointsPerStroke,
  } = options;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const [strokesState, setStrokesState] = useState<Stroke[]>([]); // updated only on stroke end / undo / redo / clear

  // metrics
  const metricsRef = useRef({
    frameCount: 0,
    lastFrameMs: 0,
    maxFrameMs: 0,
    totalSegmentsDrawn: 0,
  });

  const snapshotsRef = useRef<InternalSnapshot[]>([]);

  const currentStrokeRef = useRef<Stroke | null>(null);
  // number of floats already drawn for the active stroke (even number)
  const currentStrokeDrawnRef = useRef<number>(0);
  const needFrameRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);

  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(4);
  const [currentTool, setCurrentTool] = useState<'pen' | 'eraser'>('pen');
  const [isDrawing, setIsDrawing] = useState(false);

  // derived flags (kept inline in return to avoid unused variable lint)

  // Initialize context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctxRef.current = ctx;
    // Ensure crisp lines
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    redrawAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Full redraw
  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0); // reset for clearing
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    // Fill background (visual)
    ctx.save();
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    ctx.restore();
    for (const s of strokesRef.current) {
      drawStroke(ctx, s);
    }
  }, [backgroundColor, dpr]);

  // Resize handler to maintain DPR scaling
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    const needResize =
      canvas.width !== Math.floor(displayWidth * dpr) ||
      canvas.height !== Math.floor(displayHeight * dpr);
    if (needResize) {
      canvas.width = Math.floor(displayWidth * dpr);
      canvas.height = Math.floor(displayHeight * dpr);
      ctx.scale(dpr, dpr);
      redrawAll();
    }
  }, [dpr, redrawAll]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    // ResizeObserver for parent/container size changes (not just window resize)
    const canvas = canvasRef.current;
    let observer: ResizeObserver | null = null;
    if (canvas && 'ResizeObserver' in window) {
      observer = new ResizeObserver(() => resizeCanvas());
      // observe canvas parent to capture flexbox/layout changes
      observer.observe(canvas.parentElement || canvas);
    }
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (observer) observer.disconnect();
    };
  }, [resizeCanvas]);

  const requestFrame = () => {
    if (needFrameRef.current) return;
    needFrameRef.current = true;
    rafIdRef.current = requestAnimationFrame(() => {
      needFrameRef.current = false;
      incrementalDraw();
    });
  };

  const incrementalDraw = () => {
    const ctx = ctxRef.current;
    const stroke = currentStrokeRef.current;
    if (!ctx || !stroke) return;
    const pts = stroke.points;
    if (stroke.length < 4) return; // need two points to draw a segment
    let drawn = currentStrokeDrawnRef.current;
    if (drawn < 2) drawn = 2; // ensure we start from first complete point
    if (drawn >= stroke.length) return; // nothing new
    const t0 = performance.now();
    ctx.save();
    ctx.globalCompositeOperation = stroke.composite || 'source-over';
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.beginPath();
    for (let i = drawn; i < stroke.length; i += 2) {
      const prev = i - 2;
      const x1 = pts[prev]!;
      const y1 = pts[prev + 1]!;
      const x2 = pts[i]!;
      const y2 = pts[i + 1]!;
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      metricsRef.current.totalSegmentsDrawn++;
    }
    ctx.stroke();
    ctx.restore();
    currentStrokeDrawnRef.current = stroke.length;
    const dt = performance.now() - t0;
    metricsRef.current.frameCount++;
    metricsRef.current.lastFrameMs = dt;
    if (dt > metricsRef.current.maxFrameMs) metricsRef.current.maxFrameMs = dt;
  };

  const startStroke = useCallback(
    (x: number, y: number) => {
      const initialCapacity = 256; // floats (128 coordinate pairs)
      const buf = new Float32Array(initialCapacity);
      buf[0] = x;
      buf[1] = y;
      const stroke: Stroke = {
        id: Date.now(),
        color,
        size,
        points: buf,
        length: 2,
        composite: currentTool === 'eraser' ? 'destination-out' : 'source-over',
      };
      currentStrokeRef.current = stroke;
      currentStrokeDrawnRef.current = 0; // nothing drawn yet
      setIsDrawing(true);
    },
    [color, size, currentTool]
  );

  const appendPoint = (x: number, y: number) => {
    const stroke = currentStrokeRef.current;
    if (!stroke) return;
    if (maxPointsPerStroke && stroke.length / 2 >= maxPointsPerStroke) {
      return; // silently ignore extra points
    }
    if (stroke.length + 2 > stroke.points.length) {
      const next = new Float32Array(stroke.points.length * 2);
      next.set(stroke.points.subarray(0, stroke.length));
      stroke.points = next;
    }
    stroke.points[stroke.length] = x;
    stroke.points[stroke.length + 1] = y;
    stroke.length += 2;
    requestFrame();
  };

  const endStroke = () => {
    const stroke = currentStrokeRef.current;
    if (!stroke) return;
    if (stroke.length < 4) {
      if (!keepSinglePointStrokes) {
        currentStrokeRef.current = null;
        setIsDrawing(false);
        return;
      }
      // ensure dot stroke kept with minimal two points
    }
    if (stroke.length !== stroke.points.length) {
      // trim unused capacity
      stroke.points = stroke.points.slice(0, stroke.length);
    }
    // Simplify stroke if enabled and not an eraser (keeping eraser fidelity) & enough points
    if (
      simplify &&
      stroke.length >= 12 &&
      stroke.composite !== 'destination-out'
    ) {
      const simplified = simplifyStroke(
        stroke.points,
        stroke.length,
        simplifyTolerance
      );
      if (simplified && simplified.length < stroke.length) {
        stroke.originalLength = stroke.length;
        stroke.points = simplified;
        stroke.length = simplified.length; // already multiple of 2
      }
    }
    // If single-point stroke (dot), draw it now since incrementalDraw skips (<4 floats)
    if (stroke.length < 4) {
      const ctx = ctxRef.current;
      if (ctx) drawStroke(ctx, stroke);
    }
    strokesRef.current.push(stroke);
    currentStrokeRef.current = null;
    currentStrokeDrawnRef.current = 0;
    // snapshot logic
    if (strokesRef.current.length % snapshotInterval === 0) createSnapshot();
    setStrokesState([...strokesRef.current]);
    setIsDrawing(false);
  };

  const createSnapshot = () => {
    const baseCanvas = canvasRef.current;
    if (!baseCanvas) return;
    const off = document.createElement('canvas');
    off.width = baseCanvas.width;
    off.height = baseCanvas.height;
    const offCtx = off.getContext('2d');
    const ctx = ctxRef.current;
    if (!offCtx || !ctx) return;
    offCtx.drawImage(baseCanvas, 0, 0);
    snapshotsRef.current.push({
      strokeCount: strokesRef.current.length,
      canvas: off,
    });
    // limit memory
    if (snapshotsRef.current.length > maxSnapshots)
      snapshotsRef.current.shift();
  };

  const restoreFromSnapshot = (count: number) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    const snap = [...snapshotsRef.current]
      .reverse()
      .find(s => s.strokeCount <= count);
    if (snap) {
      ctx.drawImage(snap.canvas, 0, 0);
      for (let i = snap.strokeCount; i < count; i++) {
        const s = strokesRef.current[i];
        if (s) drawStroke(ctx, s);
      }
    } else {
      for (let i = 0; i < count; i++) {
        const s = strokesRef.current[i];
        if (s) drawStroke(ctx, s);
      }
    }
  };

  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    ctx.save();
    ctx.globalCompositeOperation = stroke.composite || 'source-over';
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    const pts = stroke.points;
    if (stroke.length < 4) {
      // dot
      ctx.beginPath();
      ctx.arc(pts[0]!, pts[1]!, stroke.size / 2, 0, Math.PI * 2);
      ctx.fillStyle = stroke.color;
      ctx.fill();
      ctx.restore();
      return;
    }
    ctx.beginPath();
    ctx.moveTo(pts[0]!, pts[1]!);
    for (let i = 2; i < stroke.length; i += 2) {
      ctx.lineTo(pts[i]!, pts[i + 1]!);
    }
    ctx.stroke();
    ctx.restore();
  };

  // Pointer handlers
  const handlePointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return; // left only
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    startStroke(e.clientX - rect.left, e.clientY - rect.top);
  };
  const handlePointerMove = (e: PointerEvent) => {
    if (!isDrawing || !currentStrokeRef.current) return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    appendPoint(e.clientX - rect.left, e.clientY - rect.top);
  };
  const handlePointerUp = () => {
    if (!isDrawing) return;
    endStroke();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.style.touchAction = 'none';
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [handlePointerDown, handlePointerMove]);

  // Undo / Redo / Clear
  const removedStrokesRef = useRef<Stroke[]>([]);
  const undo = useCallback(() => {
    // finalize in-progress stroke first
    if (currentStrokeRef.current) endStroke();
    if (!strokesRef.current.length) return;
    const s = strokesRef.current.pop()!;
    removedStrokesRef.current.push(s);
    restoreFromSnapshot(strokesRef.current.length);
    setStrokesState([...strokesRef.current]);
  }, []);
  const redo = useCallback(() => {
    if (currentStrokeRef.current) endStroke();
    if (!removedStrokesRef.current.length) return;
    const s = removedStrokesRef.current.pop()!;
    strokesRef.current.push(s);
    drawStroke(ctxRef.current!, s);
    setStrokesState([...strokesRef.current]);
  }, []);

  const clear = useCallback(() => {
    strokesRef.current = [];
    removedStrokesRef.current = [];
    snapshotsRef.current = [];
    redrawAll();
    setStrokesState([]);
  }, [redrawAll]);

  const flush = () => {
    if (currentStrokeRef.current) endStroke();
  };

  const exportStrokes = () => {
    flush();
    const serialized = strokesRef.current.map(s => ({
      id: s.id,
      color: s.color,
      size: s.size,
      composite: s.composite,
      points: Array.from(s.points.subarray(0, s.length)),
      length: s.length,
      originalLength: s.originalLength,
    }));
    return JSON.stringify({
      version: 1,
      dpr,
      backgroundColor,
      strokes: serialized,
    });
  };

  const importStrokes = (json: string) => {
    try {
      const data = JSON.parse(json) as any;
      if (!data || !Array.isArray(data.strokes)) return;
      strokesRef.current = data.strokes.map((s: any) => ({
        id: s.id ?? Date.now(),
        color: s.color || '#000',
        size: s.size || 2,
        composite: s.composite || 'source-over',
        points: Float32Array.from(s.points || []),
        length:
          s.length && s.length <= (s.points?.length || 0)
            ? s.length
            : s.points?.length || 0,
        originalLength: s.originalLength,
      }));
      removedStrokesRef.current = [];
      snapshotsRef.current = [];
      redrawAll();
      setStrokesState([...strokesRef.current]);
    } catch {}
  };

  const exportPNG = async (quality = 1): Promise<Blob> => {
    const canvas = canvasRef.current;
    return new Promise((resolve, reject) => {
      if (!canvas) return reject(new Error('Canvas missing'));
      canvas.toBlob(
        blob => {
          if (!blob) return reject(new Error('Blob export failed'));
          resolve(blob);
        },
        'image/png',
        quality
      );
    });
  };

  return {
    canvasRef: canvasRef as React.RefObject<HTMLCanvasElement>,
    strokes: strokesState,
    isDrawing,
    currentTool,
    pointerDown: handlePointerDown,
    undo,
    redo,
    clear,
    flush,
    setColor,
    setSize,
    setTool: setCurrentTool,
    color,
    size,
    canUndo: strokesState.length > 0,
    canRedo: removedStrokesRef.current.length > 0,
    redrawAll,
    exportPNG,
    exportStrokes,
    importStrokes,
    metrics: metricsRef.current,
  };
}

// --- Stroke Simplification (Ramer-Douglas-Peucker) ---
function simplifyStroke(
  points: Float32Array,
  length: number,
  epsilon: number
): Float32Array | null {
  const count = length / 2;
  if (count <= 2) return null;
  const kept = new Uint8Array(count); // mark kept points
  kept[0] = 1;
  kept[count - 1] = 1;
  const stack: Array<{ start: number; end: number }> = [
    { start: 0, end: count - 1 },
  ];
  const epsSq = epsilon * epsilon;
  while (stack.length) {
    const { start, end } = stack.pop()!;
    let maxDist = -1;
    let index = -1;
    const x1 = points[start * 2]!;
    const y1 = points[start * 2 + 1]!;
    const x2 = points[end * 2]!;
    const y2 = points[end * 2 + 1]!;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const denom = dx * dx + dy * dy || 1;
    for (let i = start + 1; i < end; i++) {
      const px = points[i * 2]!;
      const py = points[i * 2 + 1]!;
      // perpendicular distance squared
      const t = ((px - x1) * dx + (py - y1) * dy) / denom;
      const projx = x1 + t * dx;
      const projy = y1 + t * dy;
      const ddx = px - projx;
      const ddy = py - projy;
      const distSq = ddx * ddx + ddy * ddy;
      if (distSq > maxDist) {
        maxDist = distSq;
        index = i;
      }
    }
    if (maxDist > epsSq && index !== -1) {
      kept[index] = 1;
      stack.push({ start, end: index });
      stack.push({ start: index, end });
    }
  }
  // Count kept
  let keptCount = 0;
  for (let i = 0; i < count; i++) if (kept[i]) keptCount++;
  if (keptCount === count) return null; // nothing removed
  const out = new Float32Array(keptCount * 2);
  let o = 0;
  for (let i = 0; i < count; i++) {
    if (kept[i]) {
      out[o++] = points[i * 2]!;
      out[o++] = points[i * 2 + 1]!;
    }
  }
  return out;
}
