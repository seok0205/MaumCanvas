import type Konva from 'konva';
import { memo, useCallback, useMemo } from 'react';
import { Layer, Line, Rect, Stage } from 'react-konva';

import { Button } from '@/components/ui/interactive/button';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { DrawingLine, StageSize } from '@/types/drawing';
import { Palette } from 'lucide-react';

interface DrawingStageProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  stageSize: StageSize;
  currentLines: DrawingLine[];
  isEditingActive: boolean;
  onMouseDown: (e: any) => void;
  onMouseMove: (e: any) => void;
  onMouseUp: (e: any) => void;
  onReactivate: () => void;
  saveAnimationKey: number;
  reActivateButtonRef: React.RefObject<HTMLButtonElement | null>;
}

/**
 * Konva Stage와 캔버스 렌더링을 담당하는 컴포넌트
 * 단일 책임: 캔버스 렌더링과 기본 상호작용만 처리
 */
const DrawingStage = memo<DrawingStageProps>(
  ({
    stageRef,
    stageSize,
    currentLines,
    isEditingActive,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onReactivate,
    saveAnimationKey,
    reActivateButtonRef,
  }) => {
    const reduceMotion = useReducedMotion();

    // 메모이즈된 핸들러
    const handleReactivate = useCallback(() => {
      onReactivate();
    }, [onReactivate]);

    const supportsPointer = useMemo(
      () => typeof window !== 'undefined' && 'PointerEvent' in window,
      []
    );

    const pointerHandlers = useMemo(
      () => ({
        onPointerDown: (e: any) => {
          if (e?.evt && typeof e.evt.preventDefault === 'function') {
            e.evt.preventDefault();
          }
          onMouseDown(e);
        },
        onPointerMove: (e: any) => {
          if (e?.evt && typeof e.evt.preventDefault === 'function') {
            e.evt.preventDefault();
          }
          onMouseMove(e);
        },
        onPointerUp: (e: any) => {
          if (e?.evt && typeof e.evt.preventDefault === 'function') {
            e.evt.preventDefault();
          }
          onMouseUp(e);
        },
      }),
      [onMouseDown, onMouseMove, onMouseUp]
    );

    const mouseTouchHandlers = useMemo(
      () => ({
        onMouseDown,
        onMouseMove,
        onMouseUp,
        onTouchStart: (e: any) => {
          if (e?.evt && typeof e.evt.preventDefault === 'function') {
            e.evt.preventDefault();
          }
          onMouseDown(e);
        },
        onTouchMove: (e: any) => {
          if (e?.evt && typeof e.evt.preventDefault === 'function') {
            e.evt.preventDefault();
          }
          onMouseMove(e);
        },
        onTouchEnd: (e: any) => {
          if (e?.evt && typeof e.evt.preventDefault === 'function') {
            e.evt.preventDefault();
          }
          onMouseUp(e);
        },
      }),
      [onMouseDown, onMouseMove, onMouseUp]
    );

    return (
      <div
        className={`relative rounded-lg border border-gray-300 bg-white shadow-sm overscroll-contain ${
          isEditingActive ? 'touch-none select-none' : ''
        }`}
        style={{ width: stageSize.width, height: stageSize.height }}
      >
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          {...(supportsPointer ? pointerHandlers : mouseTouchHandlers)}
          onContextMenu={(e: any) => {
            // 롱프레스 컨텍스트 메뉴 방지 (iPad 등)
            if (e?.evt && typeof e.evt.preventDefault === 'function') {
              e.evt.preventDefault();
            }
          }}
          className={`transition-all ${
            isEditingActive
              ? 'cursor-crosshair'
              : 'cursor-not-allowed opacity-60'
          } bg-white rounded-lg`}
        >
          {/* 배경 레이어 (내보내기 시 흰색 배경 포함) */}
          <Layer listening={false}>
            <Rect
              x={0}
              y={0}
              width={stageSize.width}
              height={stageSize.height}
              fill='#ffffff'
            />
          </Layer>
          <Layer>
            {currentLines.map(line => (
              <Line
                key={line.id}
                points={line.points}
                stroke={line.stroke}
                strokeWidth={line.strokeWidth}
                tension={0.5}
                lineCap='round'
                lineJoin='round'
                globalCompositeOperation={line.globalCompositeOperation}
              />
            ))}
          </Layer>
        </Stage>

        {!isEditingActive && (
          <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
            <Button
              ref={reActivateButtonRef}
              onClick={handleReactivate}
              className={`flex items-center gap-2 pointer-events-auto bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-4 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition ${
                reduceMotion ? '' : 'origin-center motion-safe:animate-none'
              } ${reduceMotion ? '' : 'save-scale-in'}`}
              data-anim-key={saveAnimationKey.toString()}
            >
              <Palette className='w-5 h-5' /> 그림 그리기
            </Button>
          </div>
        )}
      </div>
    );
  }
);

DrawingStage.displayName = 'DrawingStage';

export { DrawingStage };
