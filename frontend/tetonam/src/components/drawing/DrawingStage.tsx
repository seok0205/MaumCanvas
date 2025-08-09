import type Konva from 'konva';
import React from 'react';
import { Layer, Line, Stage } from 'react-konva';

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
const DrawingStage = React.memo<DrawingStageProps>(
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

    return (
      <div
        className='relative rounded-lg border border-gray-300 bg-white shadow-sm'
        style={{ width: stageSize.width, height: stageSize.height }}
      >
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          onMouseDown={onMouseDown}
          onMousemove={onMouseMove}
          onMouseup={onMouseUp}
          onTouchStart={onMouseDown}
          onTouchMove={onMouseMove}
          onTouchEnd={onMouseUp}
          className={`transition-all ${
            isEditingActive
              ? 'cursor-crosshair'
              : 'cursor-not-allowed opacity-60'
          } bg-white rounded-lg`}
        >
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
              onClick={onReactivate}
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
