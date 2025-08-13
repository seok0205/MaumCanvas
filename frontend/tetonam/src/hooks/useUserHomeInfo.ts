import { userService } from '@/services/userService';
import type { MainMyInfoResponse } from '@/types/api';
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
  data: { name: string; nickname: string; id?: number } | undefined;
  userName: string | undefined; // 편의를 위한 별칭
  userNickname: string | undefined; // 편의를 위한 별칭
  isLoading: boolean;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
  refetch: () => void;
}

/**
 * 메인 화면용 사용자 정보 조회 훅
 * 사용자의 이름과 닉네임을 가져옵니다.
 * CommonHeader와 대시보드 환영 메시지에서 사용합니다.
 *
 * TanStack Query v5 Best Practice:
 * - enabled 옵션으로 조건부 쿼리 실행
 * - select 옵션으로 필요한 데이터만 추출
 * - 기본 staleTime을 10분으로 설정하여 불필요한 재요청 방지
 * - gcTime을 30분으로 설정하여 캐시 보존
 * - 최대 3회 재시도로 네트워크 오류 대응
 */
export const useUserHomeInfo = (options: UseUserHomeInfoOptions = {}): UseUserHomeInfoReturn => {
  const {
    enabled = true,
    staleTime = 10 * 60 * 1000, // 10분
    gcTime = 30 * 60 * 1000, // 30분
  } = options;

  const query = useQuery({
    queryKey: USER_QUERY_KEYS.HOME_MY_INFO,
    queryFn: ({ signal }) => userService.getHomeMyInfo(signal),
    enabled, // 🔥 조건부 쿼리 실행 지원
    staleTime,
    gcTime,
    placeholderData: keepPreviousData, // 🔥 매끄러운 리페치 전환
    refetchOnWindowFocus: true, // UX 개선: 탭 복귀 시 최신 데이터 확인
    refetchOnMount: true, // 컴포넌트 마운트 시 최신 데이터 확인
    select: (data: MainMyInfoResponse) => ({
      // 🔥 select로 필요한 데이터만 추출 및 변환
      name: data.name,
      nickname: data.nickname,
      ...(data.id && { id: data.id }),
      ...(data.userId && { id: data.userId }),
    }),
    retry: (failureCount, error) => {
      // 네트워크 오류만 재시도 (공식 권장 패턴)
      if (error instanceof Error && error.message.includes('Network Error')) {
        return failureCount < 3;
      }
      return false;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // 지수 백오프
  });

  return {
    // 원본 쿼리 데이터 (select로 변환된 결과)
    data: query.data,
    // 편의를 위한 별칭들
    userName: query.data?.name,
    userNickname: query.data?.nickname,
    // 쿼리 상태들
    isLoading: query.isPending,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
  };
};

// Query Key 내보내기 (다른 곳에서 무효화할 때 사용)
export { USER_QUERY_KEYS };
