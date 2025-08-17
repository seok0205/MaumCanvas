import { useCallback } from 'react';

export interface CompressedLine {
  i: number; // 고유 ID
  c: string; // 선 색상
  w: number; // 선 굵기
  m?: 'd' | null; // 지우개 모드 마커
  p: number[]; // [x0,y0, dx1,dy1, dx2,dy2 ...] 델타 좌표
}
export interface CompressedPayloadV1 {
  v: 1;
  lines: CompressedLine[];
}
export type AnyCompressed = CompressedPayloadV1; // 향후 버전 확장성을 위한 유니온 타입

export interface LineLike {
  id: number;
  points: number[];
  stroke: string;
  strokeWidth: number;
  globalCompositeOperation?: string;
}

/**
 * 그려진 선 데이터의 델타 압축/해제 기능을 제공하는 훅입니다.
 * localStorage 공간 절약을 위한 순수 변환 유틸리티들을 포함합니다.
 */
export const useCompressedLines = () => {
  const compress = useCallback((lines: LineLike[]): string => {
    const payload: CompressedPayloadV1 = {
      v: 1,
      lines: lines.map(l => {
        const pts: number[] = Array.isArray(l.points) ? l.points : [];
        if (pts.length < 2) {
          return {
            i: l.id,
            c: l.stroke,
            w: l.strokeWidth,
            p: [],
            m: null,
          } as CompressedLine;
        }
        const firstX = pts[0] ?? 0;
        const firstY = pts[1] ?? 0;
        const arr: number[] = [firstX, firstY]; // 첫 번째 점은 절대 좌표
        for (let k = 2; k + 1 < pts.length; k += 2) {
          const currX = pts[k] ?? firstX;
          const currY = pts[k + 1] ?? firstY;
          const prevX = pts[k - 2] ?? currX;
          const prevY = pts[k - 1] ?? currY;
          arr.push(currX - prevX, currY - prevY);
        }
        return {
          i: l.id,
          c: l.stroke,
          w: l.strokeWidth,
          m: l.globalCompositeOperation === 'destination-out' ? 'd' : null,
          p: arr,
        } as CompressedLine;
      }),
    };
    return JSON.stringify(payload);
  }, []);

  const decompress = useCallback((raw: string): LineLike[] => {
    if (!raw) return [];
    let parsed: AnyCompressed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return [];
    }
    if (parsed.v !== 1) return [];
    return parsed.lines.map(l => {
      const p: number[] = Array.isArray(l.p) ? l.p : [];
      if (p.length < 2) {
        return {
          id: l.i,
          points: [],
          stroke: l.c,
          strokeWidth: l.w,
          globalCompositeOperation:
            l.m === 'd' ? 'destination-out' : 'source-over',
        };
      }
      const baseX = p[0] ?? 0;
      const baseY = p[1] ?? 0;
      const pts: number[] = [baseX, baseY];
      for (let k = 2; k + 1 < p.length; k += 2) {
        const dx = p[k] ?? 0;
        const dy = p[k + 1] ?? 0;
        const prevX = pts[pts.length - 2] ?? baseX;
        const prevY = pts[pts.length - 1] ?? baseY;
        pts.push(prevX + dx, prevY + dy);
      }
      return {
        id: l.i,
        points: pts,
        stroke: l.c,
        strokeWidth: l.w,
        globalCompositeOperation:
          l.m === 'd' ? 'destination-out' : 'source-over',
      };
    });
  }, []);

  const estimateBytes = useCallback((str: string) => {
    if (!str) return 0;
    return new Blob([str]).size; // 대략적인 크기 계산
  }, []);

  return { compress, decompress, estimateBytes };
};
