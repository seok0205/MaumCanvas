import { useCallback, useEffect, useState } from 'react';

import { A4_RATIO } from '@/constants/canvas';
import type { StageSize } from '@/types/drawing';

interface UseFullscreenCanvasProps {
  setStageSize: (size: StageSize) => void;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

/**
 * 전체화면 캔버스 관리를 위한 커스텀 훅
 * 전체화면 상태와 캔버스 크기 계산을 담당
 */
export const useFullscreenCanvas = ({
  setStageSize,
  onFullscreenChange,
}: UseFullscreenCanvasProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 전체화면 모드에서 캔버스 크기 계산
  const calculateFullscreenStageSize = useCallback(() => {
    if (!isFullscreen) return;

    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;

    // A4 비율을 유지하면서 화면에 맞는 최대 크기 계산
    let height = screenHeight * 0.9; // 90% 사용 (여백 고려)
    let width = height / A4_RATIO;

    if (width > screenWidth * 0.9) {
      width = screenWidth * 0.9;
      height = width * A4_RATIO;
    }

    setStageSize({
      width: Math.floor(width),
      height: Math.floor(height),
    });
  }, [isFullscreen, setStageSize]);

  // 전체화면 진입
  const enterFullscreen = useCallback(() => {
    setIsFullscreen(true);
  }, []);

  // 전체화면 종료
  const exitFullscreen = useCallback(() => {
    setIsFullscreen(false);
  }, []);

  // 전체화면 상태 변경 시 캔버스 크기 재계산
  useEffect(() => {
    if (isFullscreen) {
      calculateFullscreenStageSize();
    }
  }, [isFullscreen, calculateFullscreenStageSize]);

  // 전체화면 변경 이벤트 리스너
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      onFullscreenChange?.(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener(
        'webkitfullscreenchange',
        handleFullscreenChange
      );
      document.removeEventListener(
        'mozfullscreenchange',
        handleFullscreenChange
      );
      document.removeEventListener(
        'MSFullscreenChange',
        handleFullscreenChange
      );
    };
  }, [onFullscreenChange]);

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    calculateFullscreenStageSize,
  };
};
