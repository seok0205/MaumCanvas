import { useCallback, useEffect, useState } from 'react';

import { A4_RATIO } from '@/constants/canvas';
import type { StageSize } from '@/types/drawing';

interface UseFullscreenCanvasProps {
  setStageSize: (size: StageSize) => void;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

// 크로스 브라우저 전체화면 API 타입 정의
interface FullscreenDocument extends Document {
  webkitFullscreenElement?: Element;
  mozFullScreenElement?: Element;
  msFullscreenElement?: Element;
  webkitFullscreenEnabled?: boolean;
  mozFullScreenEnabled?: boolean;
  msFullscreenEnabled?: boolean;
  webkitExitFullscreen?: () => Promise<void>;
  mozCancelFullScreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
}

interface FullscreenElement extends Element {
  webkitRequestFullscreen?: (options?: FullscreenOptions) => Promise<void>;
  mozRequestFullScreen?: (options?: FullscreenOptions) => Promise<void>;
  msRequestFullscreen?: (options?: FullscreenOptions) => Promise<void>;
}

/**
 * 전체화면 캔버스 관리를 위한 커스텀 훅
 * 실제 브라우저 전체화면 API 사용으로 태블릿 호환성 향상
 */
export const useFullscreenCanvas = ({
  setStageSize,
  onFullscreenChange,
}: UseFullscreenCanvasProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 전체화면 지원 여부 확인
  const isFullscreenSupported = useCallback(() => {
    const doc = document as FullscreenDocument;
    return !!(
      document.fullscreenEnabled ||
      doc.webkitFullscreenEnabled ||
      doc.mozFullScreenEnabled ||
      doc.msFullscreenEnabled
    );
  }, []);

  // 현재 전체화면 요소 확인
  const getFullscreenElement = useCallback(() => {
    const doc = document as FullscreenDocument;
    return (
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement ||
      null
    );
  }, []);

  // 전체화면 모드에서 캔버스 크기 계산 (성능 최적화)
  const calculateFullscreenStageSize = useCallback(() => {
    if (!isFullscreen) return;

    // 실제 화면 크기 사용 (태블릿 최적화)
    const screenWidth = window.screen.width || window.innerWidth;
    const screenHeight = window.screen.height || window.innerHeight;

    // 안전 여백을 더 여유있게 설정 (태블릿 UI 고려)
    const safePadding = 0.95; // 95% 사용으로 여백 확보

    // A4 비율을 유지하면서 화면에 맞는 최대 크기 계산
    let height = screenHeight * safePadding;
    let width = height / A4_RATIO;

    if (width > screenWidth * safePadding) {
      width = screenWidth * safePadding;
      height = width * A4_RATIO;
    }

    // 최종 크기 설정 (픽셀 완전수로 변환)
    setStageSize({
      width: Math.floor(width),
      height: Math.floor(height),
    });
  }, [isFullscreen, setStageSize]);

  // 전체화면 진입 (실제 브라우저 API 사용)
  const enterFullscreen = useCallback(async () => {
    if (!isFullscreenSupported()) {
      console.warn('Fullscreen is not supported on this device');
      // 전체화면을 지원하지 않는 경우 상태만 변경
      setIsFullscreen(true);
      return;
    }

    try {
      const element = document.documentElement as FullscreenElement;

      // 크로스 브라우저 전체화면 요청
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      } else {
        // 폴백: 상태만 변경
        setIsFullscreen(true);
      }
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
      // 에러 발생 시 상태만 변경하여 UI는 전체화면 모드로 동작
      setIsFullscreen(true);
    }
  }, [isFullscreenSupported]);

  // 전체화면 종료 (실제 브라우저 API 사용)
  const exitFullscreen = useCallback(async () => {
    try {
      const doc = document as FullscreenDocument;

      // 실제 전체화면 모드인 경우에만 API 호출
      if (getFullscreenElement()) {
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
          await doc.mozCancelFullScreen();
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen();
        }
      } else {
        // 상태만 변경
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Failed to exit fullscreen:', error);
      // 에러 발생 시 상태만 변경
      setIsFullscreen(false);
    }
  }, [getFullscreenElement]);

  // 전체화면 상태 변경 시 캔버스 크기 재계산
  useEffect(() => {
    if (isFullscreen) {
      // 전체화면 진입 시 약간의 지연을 두어 레이아웃 안정화
      const timeoutId = setTimeout(() => {
        calculateFullscreenStageSize();
      }, 100);

      return () => clearTimeout(timeoutId);
    }

    // early return이 있는 경우 기본 cleanup 함수 반환
    return () => {};
  }, [isFullscreen, calculateFullscreenStageSize]);

  // 전체화면 변경 이벤트 리스너 (성능 최적화된 이벤트 핸들링)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!getFullscreenElement();
      setIsFullscreen(isCurrentlyFullscreen);
      onFullscreenChange?.(isCurrentlyFullscreen);
    };

    // 크로스 브라우저 이벤트 리스너 등록
    const events = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'MSFullscreenChange',
    ];

    events.forEach(event => {
      document.addEventListener(event, handleFullscreenChange, {
        passive: true,
      });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleFullscreenChange);
      });
    };
  }, [getFullscreenElement, onFullscreenChange]);

  // 윈도우 리사이즈 이벤트 처리 (태블릿 회전 대응)
  useEffect(() => {
    if (!isFullscreen) return;

    let timeoutId: number;

    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        calculateFullscreenStageSize();
      }, 150);
    };

    window.addEventListener('resize', debouncedResize, { passive: true });
    window.addEventListener('orientationchange', debouncedResize, {
      passive: true,
    });

    return () => {
      window.removeEventListener('resize', debouncedResize);
      window.removeEventListener('orientationchange', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [isFullscreen, calculateFullscreenStageSize]);

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    calculateFullscreenStageSize,
    isFullscreenSupported: isFullscreenSupported(),
  };
};
