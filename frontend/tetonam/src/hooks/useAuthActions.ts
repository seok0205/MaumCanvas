import type { UserRole } from '@/constants/userRoles';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/useAuthStore';
import type { RegisterCredentials } from '@/types/api';
import { useCallback } from 'react';

interface UseAuthActionsReturn {
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterCredentials) => Promise<boolean>;
  logout: () => void;
  selectUserRole: (userRole: UserRole) => void;
}

// 인증 관련 비즈니스 로직을 분리한 커스텀 훅
export const useAuthActions = (): UseAuthActionsReturn => {
  const { login, register, logout, setSelectedUserRole } = useAuthStore();
  const { toast } = useToast();

  const handleLogin = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        const success = await login(email, password);
        return success;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '로그인에 실패했습니다.';
        toast({
          title: '로그인 실패',
          description: errorMessage,
          variant: 'destructive',
        });
        console.error('Login failed:', error);
        return false;
      }
    },
    [login, toast]
  );

  const handleRegister = useCallback(
    async (userData: RegisterCredentials): Promise<boolean> => {
      try {
        const success = await register(userData);
        if (success) {
          toast({
            title: '회원가입 성공',
            description: '성공적으로 회원가입되었습니다.',
          });
        }
        return success;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '회원가입에 실패했습니다.';
        toast({
          title: '회원가입 실패',
          description: errorMessage,
          variant: 'destructive',
        });
        console.error('Registration failed:', error);
        return false;
      }
    },
    [register, toast]
  );

  // 단순한 동기 함수는 useCallback 불필요
  const handleLogout = () => {
    logout();
    toast({
      title: '로그아웃',
      description: '성공적으로 로그아웃되었습니다.',
    });
  };

  // 단순한 상태 설정 함수는 useCallback 불필요
  const selectUserRole = (userRole: UserRole) => {
    setSelectedUserRole(userRole);
  };

  return {
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    selectUserRole,
  };
};
