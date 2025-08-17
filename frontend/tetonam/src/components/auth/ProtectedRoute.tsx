import { useTokenExpiry } from '@/hooks/useTokenExpiry';
import { useAuthStore } from '@/stores/useAuthStore';
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute = ({
  children,
  requiredRole,
}: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  // 토큰 만료 체크 활성화
  useTokenExpiry();

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  // 역할 기반 접근 제어 (필요한 경우)
  if (
    requiredRole &&
    user?.roles &&
    !user.roles.includes(requiredRole as any)
  ) {
    return <Navigate to='/unauthorized' replace />;
  }

  return <>{children}</>;
};
