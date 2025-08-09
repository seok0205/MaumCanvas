import { useCallback, useEffect, useLayoutEffect } from 'react';

import { A4_RATIO } from '@/constants/drawing';
import { useUIStore } from '@/stores/useUIStore';

export const useCanvasSize = (
  canvasContainerRef: React.RefObject<HTMLDivElement>
) => {
  const { isEditingActive, setStageSize } = useUIStore();

  // Stage 크기 계산 (A4 비율)
  const recalcStageSize = useCallback(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const padding = 16; // 여백
    const availWidth = container.clientWidth - padding * 2;
    const availHeight = container.clientHeight - padding * 2;

    if (isEditingActive) {
      // A4 세로 비율 유지하면서 최대 크기
      // 높이를 기준으로 폭 계산, 폭이 넘치면 폭 기준으로 다시 계산
      let height = availHeight;
      let width = height / A4_RATIO;
      if (width > availWidth) {
        width = availWidth;
        height = width * A4_RATIO;
      }
      setStageSize({ width: Math.floor(width), height: Math.floor(height) });
    } else {
      // 비활성 상태에서는 가용 공간 채우기 (비율 자유)
      setStageSize({ width: availWidth, height: availHeight });
    }
  }, [isEditingActive, setStageSize, canvasContainerRef]);

  useLayoutEffect(() => {
    recalcStageSize();
  }, [recalcStageSize]);

  useEffect(() => {
    let frame: number | null = null;
    let lastRun = 0;
    const DEBOUNCE = 120; // ms

    const run = () => {
      frame = null;
      lastRun = Date.now();
      recalcStageSize();
    };

    const schedule = () => {
      const now = Date.now();
      if (now - lastRun > DEBOUNCE) {
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(run);
      } else {
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          setTimeout(run, DEBOUNCE - (now - lastRun));
        });
      }
    };

    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('orientationchange', schedule, { passive: true });

    return () => {
      window.removeEventListener('resize', schedule);
      window.removeEventListener('orientationchange', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [recalcStageSize]);

  return {
    recalcStageSize,
  };
};
