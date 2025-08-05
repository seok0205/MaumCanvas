import { useQuery } from '@tanstack/react-query';

import { authService } from '@/services/authService';
import { useAuthStore } from '@/stores/useAuthStore';
import { UserInfoResponse } from '@/types/api';

interface UseUserInfoReturn {
  userInfo: UserInfoResponse | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useUserInfo = (): UseUserInfoReturn => {
  const { isAuthenticated, user } = useAuthStore();

  const {
    data: userInfo,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['userInfo'],
    queryFn: () => authService.getMyInfo(),
    enabled: isAuthenticated && !!user, // 인증된 상태에서만 실행
    staleTime: 5 * 60 * 1000, // 5분
    retry: 3,
    retryDelay: 2000, // 2초
    refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 재요청 비활성화
  });

  return {
    userInfo: userInfo ?? null,
    isLoading,
    error,
    refetch,
  };
};
