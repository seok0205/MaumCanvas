import { useCallback, useState } from 'react';

interface ImageLoadState {
  [src: string]: 'loading' | 'loaded' | 'error';
}

interface UseImagePreloaderReturn {
  imageStates: ImageLoadState;
  isAllLoaded: boolean;
  preloadImages: (imageSrcs: string[]) => void;
  getImageState: (src: string) => 'loading' | 'loaded' | 'error';
}

/**
 * 이미지 프리로딩을 위한 커스텀 훅
 * 여러 이미지를 미리 로드하고 각 이미지의 상태를 추적합니다.
 *
 * @returns {UseImagePreloaderReturn} 이미지 상태와 유틸리티 함수들
 */
export function useImagePreloader(): UseImagePreloaderReturn {
  const [imageStates, setImageStates] = useState<ImageLoadState>({});

  const preloadImages = useCallback((imageSrcs: string[]) => {
    // 초기 상태를 loading으로 설정
    const initialStates: ImageLoadState = {};
    imageSrcs.forEach(src => {
      initialStates[src] = 'loading';
    });
    setImageStates(initialStates);

    // 각 이미지를 비동기적으로 프리로드
    imageSrcs.forEach(src => {
      const img = new Image();

      img.onload = () => {
        setImageStates(prev => ({
          ...prev,
          [src]: 'loaded',
        }));
      };

      img.onerror = () => {
        setImageStates(prev => ({
          ...prev,
          [src]: 'error',
        }));
      };

      // 이미지 로딩 시작
      img.src = src;
    });
  }, []);

  const getImageState = useCallback(
    (src: string) => {
      return imageStates[src] || 'loading';
    },
    [imageStates]
  );

  const isAllLoaded = Object.values(imageStates).every(
    state => state === 'loaded'
  );

  return {
    imageStates,
    isAllLoaded,
    preloadImages,
    getImageState,
  };
}
