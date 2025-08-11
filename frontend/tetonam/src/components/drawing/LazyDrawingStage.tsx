import { Suspense, lazy, forwardRef, useImperativeHandle, useRef, useEffect, useState } from 'react';
import type { DrawingLine, StageSize } from '@/types/drawing';

// DrawingStage를 동적으로 import
const DrawingStage = lazy(() =>
  import('./DrawingStage').then(module => ({ default: module.DrawingStage }))
);

// 페이지 마운트 시 즉시 preload - Best Practice
let isPreloadingInitiated = false;
const initiatePreload = () => {
  if (!isPreloadingInitiated) {
    isPreloadingInitiated = true;
    // 백그라운드에서 DrawingStage 미리 로딩
    import('./DrawingStage').then(() => {
      console.log('DrawingStage preloaded on mount');
    }).catch((error) => {
      console.warn('DrawingStage mount preload failed:', error);
      isPreloadingInitiated = false;
    });
  }
};

// 조건부 preloading을 위한 함수
let isConditionalPreloading = false;
let preloadPromise: Promise<any> | null = null;

const preloadDrawingStage = () => {
  if (!isConditionalPreloading && !preloadPromise) {
    isConditionalPreloading = true;
    preloadPromise = import('./DrawingStage').then(() => {
      console.log('DrawingStage conditionally preloaded');
    }).catch((error) => {
      console.warn('DrawingStage conditional preload failed:', error);
      isConditionalPreloading = false;
      preloadPromise = null;
    });
  }
  return preloadPromise;
};

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
  enablePreload?: boolean; // 새로운 prop: 미리 로딩 활성화 여부
}

/**
 * DrawingStage의 지연 로딩 래퍼
 * Konva 라이브러리를 필요할 때만 로드하여 초기 번들 크기를 줄임
 * forwardRef 패턴으로 ref 안정성 보장
 * 페이지 마운트 시 즉시 preloading + 조건부 preloading 지원
 */
export const LazyDrawingStage = forwardRef<any, DrawingStageProps>((props, ref) => {
  const { enablePreload = false, ...stageProps } = props;
  const innerRef = useRef<any>(null);
  const [preloadTriggered, setPreloadTriggered] = useState(false);

  // ref를 안정적으로 전달하기 위한 useImperativeHandle
  useImperativeHandle(ref, () => innerRef.current, []);

  // 페이지 마운트 시 즉시 preload (Best Practice)
  useEffect(() => {
    initiatePreload();
  }, []);

  // 조건부 preloading 효과
  useEffect(() => {
    if (enablePreload && !preloadTriggered) {
      setPreloadTriggered(true);
      preloadDrawingStage();
    }
  }, [enablePreload, preloadTriggered]);

  return (
    <Suspense fallback={<CanvasLoading />}>
      <DrawingStage {...stageProps} stageRef={innerRef} />
    </Suspense>
  );
});

LazyDrawingStage.displayName = 'LazyDrawingStage';

// 외부에서 미리 로딩을 트리거할 수 있도록 export
export { preloadDrawingStage, initiatePreload };
