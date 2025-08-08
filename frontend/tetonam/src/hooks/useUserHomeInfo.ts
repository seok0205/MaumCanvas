import { userService } from '@/services/userService';
import type { MainMyInfoResponse } from '@/types/api';
import { AuthenticationError } from '@/types/auth';
import { useQuery } from '@tanstack/react-query';

// React Query 키 상수
const USER_QUERY_KEYS = {
  HOME_MY_INFO: ['user', 'home-my-info'] as const,
} as const;

interface UseUserHomeInfoOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

interface UseUserHomeInfoReturn {
  data: MainMyInfoResponse | undefined;
  userName: string | undefined; // 편의를 위한 별칭
  userNickname: string | undefined; // 편의를 위한 별칭
  isLoading: boolean;
  isPending: boolean;
  isError: boolean;
  error: AuthenticationError | null;
  isSuccess: boolean;
  refetch: () => void;
}

/**
 * 메인 화면용 사용자 정보 조회 훅
 * 사용자의 이름과 닉네임을 가져옵니다.
 * CommonHeader와 대시보드 환영 메시지에서 사용합니다.
 */
export const useUserHomeInfo = (
  options: UseUserHomeInfoOptions = {}
): UseUserHomeInfoReturn => {
  const {
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5분
    gcTime = 10 * 60 * 1000, // 10분
  } = options;

  const query = useQuery({
    queryKey: USER_QUERY_KEYS.HOME_MY_INFO,
    queryFn: ({ signal }) => userService.getHomeMyInfo(signal),
    enabled,
    staleTime,
    gcTime,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    throwOnError: false, // 에러를 throw하지 않고 error 상태로 관리
  });

  return {
    data: query.data,
    userName: query.data?.name,
    userNickname: query.data?.nickname,
    isLoading: query.isLoading,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error as AuthenticationError | null,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
  };
};

// Query Key 내보내기 (다른 곳에서 무효화할 때 사용)
export { USER_QUERY_KEYS };
