import { useAuthStore } from '@/stores/useAuthStore';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 라우트 경로 상수
export const ROUTES = {
  DASHBOARD: '/dashboard',
  USER_TYPE_SELECTION: '/user-role-selection',
  ONBOARDING: '/onboarding',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

// 리다이렉트 로직을 커스텀 훅으로 분리
export const useRedirectLogic = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    try {
      // 인증된 사용자는 대시보드로
      if (isAuthenticated) {
        navigate(ROUTES.DASHBOARD);
        return;
      }

      // 인증되지 않은 모든 사용자는 온보딩으로 (시작 페이지)
      navigate(ROUTES.ONBOARDING);
    } catch (error) {
      // 에러 발생 시 기본 경로로 리다이렉트
      try {
        navigate(ROUTES.ONBOARDING);
      } catch (fallbackError) {
        // 최후의 수단으로 window.location 사용
        window.location.href = ROUTES.ONBOARDING;
      }
    }
  }, [isAuthenticated, navigate]);
};
