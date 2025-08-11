import { userService } from '@/services/userService';
import type { MainMyInfoResponse } from '@/types/api';
import { AuthenticationError } from '@/types/auth';
import { useQuery, keepPreviousData } from '@tanstack/react-query';

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
 *
 * 성능 최적화:
 * - 기본 staleTime을 10분으로 설정하여 불필요한 재요청 방지
 * - gcTime을 30분으로 설정하여 캐시 보존
 * - 최대 3회 재시도로 네트워크 오류 대응
 */
export const useUserHomeInfo = () => {
  return useQuery({
    queryKey: USER_QUERY_KEYS.HOME_MY_INFO,
    queryFn: ({ signal }) => userService.getHomeMyInfo(signal),
    staleTime: 10 * 60 * 1000, // 10분 - 사용자 프로필 데이터에 적합
    gcTime: 30 * 60 * 1000, // 30분 - staleTime보다 길게 설정
    placeholderData: keepPreviousData, // 🔥 NEW: 매끄러운 리페치 전환
    refetchOnWindowFocus: true, // UX 개선: 탭 복귀 시 최신 데이터 확인
    refetchOnMount: true, // 컴포넌트 마운트 시 최신 데이터 확인
    retry: (failureCount, error) => {
      // 네트워크 오류만 재시도 (공식 권장 패턴)
      if (error instanceof Error && error.message.includes('Network Error')) {
        return failureCount < 3;
      }
      return false;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // 지수 백오프
  });
};

// Query Key 내보내기 (다른 곳에서 무효화할 때 사용)
export { USER_QUERY_KEYS };
