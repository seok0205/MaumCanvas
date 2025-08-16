import { userService } from '@/services/userService';
import { useAuthStore } from '@/stores/useAuthStore';
import { useQuery } from '@tanstack/react-query';

/**
 * 사용자 프로필 정보 훅
 * 
 * TanStack Query를 사용하여 사용자 정보를 관리합니다.
 * authStore는 순수 인증 상태만 관리하고, 
 * 사용자 정보는 이 훅을 통해 서버 상태로 관리됩니다.
 */
export const useUserProfile = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: ({ signal }: { signal?: AbortSignal }) => 
      userService.getHomeMyInfo(signal),
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10분
    gcTime: 30 * 60 * 1000, // 30분
    retry: (failureCount: number, error: Error) => {
      if (error.message.includes('Network Error')) {
        return failureCount < 3;
      }
      return false;
    },
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * 사용자 ID를 반환하는 편의 훅
 * localStorage 키 생성 등에 사용
 */
export const useUserId = () => {
  const { data: user } = useUserProfile();
  
  return {
    userId: user?.id?.toString() || user?.userId?.toString() || null,
    isLoading: !user,
  };
};

/**
 * 사용자 닉네임을 반환하는 편의 훅
 * 커뮤니티 권한 확인 등에 사용
 */
export const useUserNickname = () => {
  const { data: user } = useUserProfile();
  
  return {
    nickname: user?.nickname || null,
    isLoading: !user,
  };
};
