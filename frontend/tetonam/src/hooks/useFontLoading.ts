import { useEffect, useState } from 'react';

interface FontLoadingState {
  isLoaded: boolean;
  isError: boolean;
  error?: Error;
}

export const useFontLoading = (
  fontFamily: string = 'Pretendard'
): FontLoadingState => {
  const [state, setState] = useState<FontLoadingState>({
    isLoaded: false,
    isError: false,
  });

  useEffect(() => {
    // 폰트 로딩 상태 확인
    const checkFontLoading = async () => {
      try {
        // document.fonts API를 사용하여 폰트 로딩 상태 확인
        if ('fonts' in document) {
          await document.fonts.ready;

          // 특정 폰트가 로드되었는지 확인
          const isFontLoaded = document.fonts.check(`12px ${fontFamily}`);

          if (isFontLoaded) {
            setState({ isLoaded: true, isError: false });
          } else {
            // 폰트 로딩 실패 시 에러 상태로 설정
            setState({
              isLoaded: false,
              isError: true,
              error: new Error(`폰트 ${fontFamily} 로딩 실패`),
            });
          }
        } else {
          // document.fonts API를 지원하지 않는 브라우저의 경우
          // 일정 시간 후 로드된 것으로 간주
          setTimeout(() => {
            setState({ isLoaded: true, isError: false });
          }, 1000);
        }
      } catch (error) {
        setState({
          isLoaded: false,
          isError: true,
          error:
            error instanceof Error
              ? error
              : new Error('폰트 로딩 중 오류 발생'),
        });
      }
    };

    checkFontLoading();
  }, [fontFamily]);

  return state;
};

// 폰트 로딩 상태를 전역적으로 관리하는 훅
export const useGlobalFontLoading = () => {
  const [isFontsLoaded, setIsFontsLoaded] = useState(false);

  useEffect(() => {
    const handleFontsLoaded = () => {
      setIsFontsLoaded(true);
    };

    // 폰트 로딩 완료 이벤트 리스너
    if ('fonts' in document) {
      document.fonts.addEventListener('loadingdone', handleFontsLoaded);

      // 이미 로드된 경우
      if (document.fonts.status === 'loaded') {
        setIsFontsLoaded(true);
      }
    } else {
      // 폰트 API를 지원하지 않는 경우 기본값으로 설정
      setIsFontsLoaded(true);
    }

    return () => {
      if ('fonts' in document) {
        document.fonts.removeEventListener('loadingdone', handleFontsLoaded);
      }
    };
  }, []);

  return isFontsLoaded;
};
