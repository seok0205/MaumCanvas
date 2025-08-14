import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * PWA 환경에서 안전한 네비게이션을 위한 훅
 * 그리기 중 예상치 못한 리다이렉트를 방지합니다
 */
export const useSafeNavigation = () => {
  const navigate = useNavigate();
  const isDrawingActiveRef = useRef(false);
  const navigationBlockedRef = useRef(false);

  /**
   * 그리기 활성 상태 설정
   */
  const setDrawingActive = useCallback((active: boolean) => {
    isDrawingActiveRef.current = active;
    if (active) {
      navigationBlockedRef.current = true;
    }
  }, []);

  /**
   * 네비게이션 차단 해제
   */
  const allowNavigation = useCallback(() => {
    navigationBlockedRef.current = false;
  }, []);

  /**
   * 안전한 네비게이션 함수
   */
  const safeNavigate = useCallback(
    (to: string, options?: any) => {
      // 그리기 중이면 네비게이션 차단
      if (isDrawingActiveRef.current || navigationBlockedRef.current) {
        console.warn(
          'Navigation blocked during drawing session:',
          to,
          'Drawing active:',
          isDrawingActiveRef.current,
          'Navigation blocked:',
          navigationBlockedRef.current
        );
        return false;
      }

      try {
        navigate(to, options);
        return true;
      } catch (error) {
        console.error('Safe navigation failed:', error);
        return false;
      }
    },
    [navigate]
  );

  /**
   * 브라우저 뒤로가기 차단
   */
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (isDrawingActiveRef.current || navigationBlockedRef.current) {
        event.preventDefault();
        // 현재 상태를 다시 푸시하여 뒤로가기 차단
        window.history.pushState(null, '', window.location.href);
        console.warn('Back navigation blocked during drawing session');
      }
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDrawingActiveRef.current) {
        event.preventDefault();
        event.returnValue = '그리기를 완료하지 않고 나가시겠습니까?';
        return '그리기를 완료하지 않고 나가시겠습니까?';
      }
      return undefined;
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return {
    setDrawingActive,
    allowNavigation,
    safeNavigate,
    isDrawingActive: isDrawingActiveRef.current,
    isNavigationBlocked: navigationBlockedRef.current,
  };
};
