import { Suspense, lazy } from 'react';
import type { DrawingLine, StageSize } from '@/types/drawing';

// DrawingStage를 동적으로 import
const DrawingStage = lazy(() => 
  import('./DrawingStage').then(module => ({ default: module.DrawingStage }))
);

// 로딩 컴포넌트
const CanvasLoading = () => (
  <div className="flex items-center justify-center w-full h-full min-h-[500px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
    <div className="flex flex-col items-center gap-3">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mint"></div>
      <p className="text-sm text-gray-600">캔버스를 불러오는 중...</p>
    </div>
  </div>
);

// DrawingStage Props를 직접 정의하여 순환 참조 방지
interface DrawingStageProps {
  stageRef: React.RefObject<any>; // Konva 타입 참조 제거
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
 * DrawingStage의 지연 로딩 래퍼
 * Konva 라이브러리를 필요할 때만 로드하여 초기 번들 크기를 줄임
 */
export const LazyDrawingStage = (props: DrawingStageProps) => {
  return (
    <Suspense fallback={<CanvasLoading />}>
      <DrawingStage {...props} />
    </Suspense>
  );
};
