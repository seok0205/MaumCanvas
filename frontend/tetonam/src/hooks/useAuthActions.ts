import type { UserRole } from '@/constants/userRoles';
import { useToast } from '@/hooks/use-toast';
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
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        const success = await login(email, password);

        // 로그인 성공 후 인증 상태가 완전히 설정될 때까지 대기
        if (success) {
          // 인증 상태가 완전히 설정될 때까지 최대 1초 대기
          let attempts = 0;
          const maxAttempts = 20; // 20 * 50ms = 1초

          while (attempts < maxAttempts) {
            const currentAuth = useAuthStore.getState();
            if (currentAuth.isAuthenticated && currentAuth.user) {
              break;
            }
            await new Promise(resolve => setTimeout(resolve, 50));
            attempts++;
          }
        }

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
        console.error('회원가입 상세 에러:', error);
        const errorMessage =
          error instanceof Error ? error.message : '회원가입에 실패했습니다.';
        toast({
          title: '회원가입 실패',
          description: errorMessage,
          variant: 'destructive',
        });
        console.error('Registration failed:', error);
        // 에러 정보를 보존하여 상위에서 처리할 수 있도록 함
        throw error;
      }
    },
    [register, toast]
  );

  // 로그아웃 핸들러 - 에러 처리 및 비동기 처리 포함
  const handleLogout = useCallback(async () => {
    try {
      // localStorage에서 토큰 삭제
      authService.logout();
      // Zustand 상태 초기화
      logout();

      toast({
        title: '로그아웃',
        description: '성공적으로 로그아웃되었습니다.',
      });

      // React Router를 사용한 네비게이션
      navigate('/login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      toast({
        title: '로그아웃 실패',
        description: '로그아웃 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  }, [logout, navigate, toast]);

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
