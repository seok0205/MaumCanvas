import { useCallback, useEffect, useState } from 'react';

type ImageLoadingState = 'idle' | 'loading' | 'loaded' | 'error';

interface UseImageLoadStateReturn {
  loadingState: ImageLoadingState;
  isLoaded: boolean;
  hasError: boolean;
  retry: () => void;
}

/**
 * 개별 이미지의 로딩 상태를 관리하는 커스텀 훅
 *
 * @param src - 이미지 소스 URL
 * @param preloaded - 이미지가 이미 프리로드되었는지 여부
 * @returns {UseImageLoadStateReturn} 로딩 상태와 유틸리티 함수들
 */
export function useImageLoadState(
  src: string,
  preloaded = false
): UseImageLoadStateReturn {
  const [loadingState, setLoadingState] = useState<ImageLoadingState>(
    preloaded ? 'loaded' : 'idle'
  );

  const loadImage = useCallback(() => {
    if (!src) return;

    setLoadingState('loading');

    const img = new Image();

    img.onload = () => {
      setLoadingState('loaded');
    };

    img.onerror = () => {
      setLoadingState('error');
    };

    img.src = src;
  }, [src]);

  const retry = useCallback(() => {
    loadImage();
  }, [loadImage]);

  useEffect(() => {
    if (!preloaded && src) {
      loadImage();
    }
  }, [src, preloaded, loadImage]);

  // preloaded 상태가 변경되면 상태 업데이트
  useEffect(() => {
    if (preloaded) {
      setLoadingState('loaded');
    }
  }, [preloaded]);

  return {
    loadingState,
    isLoaded: loadingState === 'loaded',
    hasError: loadingState === 'error',
    retry,
  };
}
