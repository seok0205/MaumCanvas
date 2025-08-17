import {
  A4_RATIO,
  CANVAS_PADDING,
  RESIZE_DEBOUNCE_TIME,
} from '@/constants/canvas';
import type { StageSize } from '@/types/drawing';
import { useCallback, useEffect, useLayoutEffect } from 'react';

interface UseCanvasResizeProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  isEditingActive: boolean;
  setStageSize: (size: StageSize) => void;
  currentStep: number;
  isExpandedMode?: boolean;
}

/**
 * 캔버스 크기 계산 및 리사이즈 처리를 담당하는 커스텀 훅
 * 웹 검색 결과: ResizeObserver 사용으로 즉시 반응성 구현
 */
export const useCanvasResize = ({
  containerRef,
  isEditingActive,
  setStageSize,
  currentStep,
  isExpandedMode = false,
}: UseCanvasResizeProps) => {
  // Stage 크기 계산 (A4 비율)
  const calculateStageSize = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // 확대 모드에서는 더 큰 캔버스 크기 계산
    if (isExpandedMode) {
      // 확대 모드에서는 뷰포트 기준으로 계산 (안내 영역이 숨겨지므로)
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // CommonHeader 높이와 여백을 고려한 사용 가능한 높이
      const headerHeight = 64; // CommonHeader 예상 높이
      const padding = 32; // 여백
      const availableHeight = viewportHeight - headerHeight - padding;
      const availableWidth = viewportWidth - padding;

      // A4 비율을 유지하면서 최대 크기 계산
      let height = availableHeight;
      let width = height / A4_RATIO;

      if (width > availableWidth) {
        width = availableWidth;
        height = width * A4_RATIO;
      }

      setStageSize({
        width: Math.floor(width),
        height: Math.floor(height),
      });
      return;
    }

    // 일반 모드에서의 기존 로직
    const availWidth = container.clientWidth - CANVAS_PADDING * 2;
    const availHeight = container.clientHeight - CANVAS_PADDING * 2;

    // 편집 여부와 무관하게 실제 그릴 A4 비율 영역을 항상 동일하게 유지 (요구사항)
    let height = availHeight;
    let width = height / A4_RATIO;
    if (width > availWidth) {
      width = availWidth;
      height = width * A4_RATIO;
    }
    setStageSize({
      width: Math.floor(width),
      height: Math.floor(height),
    });
  }, [containerRef, isEditingActive, setStageSize, isExpandedMode]);

  // 초기 크기 설정 (useLayoutEffect로 시각적 업데이트 처리)
  useLayoutEffect(() => {
    calculateStageSize();
  }, [calculateStageSize, currentStep, isEditingActive, isExpandedMode]);

  // ResizeObserver를 사용한 즉시 반응 시스템 (웹 검색 결과 적용)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ResizeObserver: paint 전에 실행되어 깜빡임 방지
    const resizeObserver = new ResizeObserver(() => {
      // 웹 검색 결과: ResizeObserver는 layout 후 paint 전에 실행됨
      // 즉시 크기 재계산 (디바운스 없음)
      calculateStageSize();
    });

    // 컨테이너 크기 변화 관찰 시작
    resizeObserver.observe(container);

    // cleanup
    return () => {
      resizeObserver.unobserve(container);
      resizeObserver.disconnect();
    };
  }, [calculateStageSize, containerRef]);

  // window resize는 기존 디바운스 유지 (일반적인 창 크기 조정용)
  useEffect(() => {
    let frame: number | null = null;
    let lastRun = 0;

    const runCalculation = () => {
      frame = null;
      lastRun = Date.now();
      calculateStageSize();
    };

    const scheduleCalculation = () => {
      const now = Date.now();
      if (now - lastRun > RESIZE_DEBOUNCE_TIME) {
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(runCalculation);
      } else {
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          setTimeout(runCalculation, RESIZE_DEBOUNCE_TIME - (now - lastRun));
        });
      }
    };

    window.addEventListener('resize', scheduleCalculation, { passive: true });
    window.addEventListener('orientationchange', scheduleCalculation, {
      passive: true,
    });

    return () => {
      window.removeEventListener('resize', scheduleCalculation);
      window.removeEventListener('orientationchange', scheduleCalculation);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [calculateStageSize]);

  return { 
    calculateStageSize,
    calculateStageSizeImmediate: calculateStageSize, // ResizeObserver로 대체되었지만 호환성 유지
  };
};
