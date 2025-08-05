import { useEffect, useState } from 'react';

interface FontFace {
  family: string;
  weight: number;
  style: string;
}

/**
 * 폰트 로딩 상태를 추적하는 커스텀 훅
 * @param fonts 로드할 폰트 목록
 * @returns 폰트 로딩 완료 여부
 */
export const useFontLoading = (fonts: FontFace[] = []): boolean => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    // 기본 폰트 설정 (Pretendard)
    const defaultFonts: FontFace[] = [
      { family: 'Pretendard', weight: 400, style: 'normal' },
      { family: 'Pretendard', weight: 500, style: 'normal' },
      { family: 'Pretendard', weight: 700, style: 'normal' },
    ];

    const fontsToLoad = fonts.length > 0 ? fonts : defaultFonts;

    // Font Loading API 지원 여부 확인
    if ('fonts' in document) {
      const fontPromises = fontsToLoad.map(font =>
        document.fonts.load(`${font.weight} ${font.style} ${font.family}`)
      );

      Promise.all(fontPromises)
        .then(() => {
          setFontsLoaded(true);
        })
        .catch(error => {
          console.warn('폰트 로딩 실패:', error);
          // 폰트 로딩 실패 시에도 true로 설정하여 앱이 정상 동작하도록 함
          setFontsLoaded(true);
        });

      // Font Loading API를 사용하는 경우 cleanup 함수 반환
      return () => {
        // cleanup 로직이 필요한 경우 여기에 추가
      };
    } else {
      // Font Loading API를 지원하지 않는 브라우저의 경우
      // 일정 시간 후에 로드된 것으로 간주
      const timer = setTimeout(() => {
        setFontsLoaded(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [fonts]);

  return fontsLoaded;
};

/**
 * 폰트 로딩 상태를 전역적으로 관리하는 훅
 */
export const useGlobalFontLoading = (): boolean => {
  return useFontLoading();
};
