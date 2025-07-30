import { useEffect, useState } from 'react';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // 초기값 설정
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // 이벤트 리스너 등록
    mql.addEventListener('change', onChange);

    // Cleanup 함수
    return () => {
      mql.removeEventListener('change', onChange);
    };
  }, []);

  return isMobile;
}
