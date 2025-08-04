import type { UserRole } from '@/constants/userRoles';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/useAuthStore';
import type { RegisterCredentials } from '@/types/api';
import type { User } from '@/types/user';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface UseAuthActionsReturn {
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  selectUserRole: (userRole: UserRole) => void;
  // 인증 상태 기반 API 호출 관리
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
}

// 인증 관련 비즈니스 로직을 분리한 커스텀 훅
export const useAuthActions = (): UseAuthActionsReturn => {
  const {
    login,
    register,
    logout,
    setSelectedUserRole,
    isAuthenticated,
    isLoading,
    user,
  } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        const success = await login(email, password);

        return success;
      } catch (error) {
        console.error('Login failed:', error);
        return false;
      }
    },
    [login]
  );

  const handleRegister = useCallback(
    async (userData: RegisterCredentials): Promise<boolean> => {
      try {
        const success = await register(userData);
        if (success) {
        }
        return success;
      } catch (error) {
        console.error('회원가입 상세 에러:', error);
        console.error('Registration failed:', error);
        // 에러 정보를 보존하여 상위에서 처리할 수 있도록 함
        throw error;
      }
    },
    [register]
  );

  // 로그아웃 핸들러 - 에러 처리 및 비동기 처리 포함
  const handleLogout = useCallback(async () => {
    try {
      // localStorage에서 토큰 삭제
      authService.logout();

      // Zustand 상태 초기화
      logout();

      // React Router를 사용한 네비게이션
      navigate('/login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  }, [logout, navigate]);

  // 사용자 역할 선택 핸들러
  const selectUserRole = useCallback(
    (userRole: UserRole) => {
      setSelectedUserRole(userRole);
    },
    [setSelectedUserRole]
  );

  return {
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    selectUserRole,
    isAuthenticated,
    isLoading,
    user,
  };
};
