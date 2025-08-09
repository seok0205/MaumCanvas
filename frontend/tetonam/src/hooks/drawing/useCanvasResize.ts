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
}

/**
 * 캔버스 크기 계산 및 리사이즈 처리를 담당하는 커스텀 훅
 */
export const useCanvasResize = ({
  containerRef,
  isEditingActive,
  setStageSize,
  currentStep,
}: UseCanvasResizeProps) => {
  // Stage 크기 계산 (A4 비율)
  const calculateStageSize = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

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
  }, [containerRef, isEditingActive, setStageSize]);

  // 초기 크기 설정
  useLayoutEffect(() => {
    calculateStageSize();
  }, [calculateStageSize, currentStep, isEditingActive]);

  // 리사이즈 이벤트 처리 (디바운스 적용)
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

  return { calculateStageSize };
};
