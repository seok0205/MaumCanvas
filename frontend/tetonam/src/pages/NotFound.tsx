import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const NotFound = () => {
  const location = useLocation();

  // 외부 시스템(에러 추적)과의 동기화
  useEffect(() => {
    // 개발 환경에서만 로깅
    if (import.meta.env.DEV) {
      console.error(
        '404 Error: User attempted to access non-existent route:',
        location.pathname
      );
    }

    // 프로덕션에서는 외부 에러 추적 시스템과 동기화
    if (import.meta.env.PROD) {
      // 에러 추적 서비스 호출 (예: Sentry)
      // errorTrackingService.captureException(new Error(`404: ${location.pathname}`));
    }
  }, [location.pathname]);

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-warm'>
      <div className='text-center'>
        <h1 className='text-4xl font-bold mb-4 text-foreground'>404</h1>
        <p className='text-xl text-muted-foreground mb-4'>
          페이지를 찾을 수 없습니다
        </p>
        <a
          href='/'
          className='text-primary hover:text-primary-dark underline transition-colors'
        >
          홈으로 돌아가기
        </a>
      </div>
    </div>
  );
};
