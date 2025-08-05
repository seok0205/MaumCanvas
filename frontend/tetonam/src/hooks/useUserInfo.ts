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
  const { isAuthenticated } = useAuthStore();

  console.log('🔍 [useUserInfo] 훅 실행, isAuthenticated:', isAuthenticated);

  const {
    data: userInfo,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['userInfo'],
    queryFn: () => {
      console.log('🔍 [useUserInfo] queryFn 실행');
      return authService.getMyInfo();
    },
    enabled: isAuthenticated, // 단순화: user 체크 제거
    staleTime: 5 * 60 * 1000, // 5분
    retry: 3,
    retryDelay: 2000, // 2초
    refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 재요청 비활성화
    // 에러 타입 안전성 개선
    select: (data: UserInfoResponse) => {
      console.log('📥 [useUserInfo] select 함수에서 받은 데이터:', data);
      return data;
    },
  });

  console.log('📊 [useUserInfo] 훅 상태:', {
    userInfo,
    isLoading,
    error: error?.message,
    isAuthenticated,
  });

  return {
    userInfo: userInfo ?? null,
    isLoading,
    error: error as Error | null,
    refetch,
  };
};
