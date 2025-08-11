import { counselingService } from '@/services/counselingService';
import { useAuthStore } from '@/stores/useAuthStore';
import type { UpcomingCounseling } from '@/types/api';
import { useQuery } from '@tanstack/react-query';

/**
 * React Query를 사용한 다가오는 상담 조회 훅
 *
 * 주요 개선사항:
 * - 자동 캐싱으로 브라우저 새로고침 시 깜빡임 방지
 * - 백그라운드 업데이트로 최신 데이터 유지
 * - 네트워크 상태에 따른 스마트한 재시도
 * - 타입 안전성 보장
 */
export const useUpcomingCounselingQuery = () => {
  const { isAuthenticated, user } = useAuthStore();

  const query = useQuery({
    // 쿼리 키: 사용자별로 캐시 분리
    queryKey: ['counseling', 'upcoming', user?.id],

    // 쿼리 함수: Promise를 반환하는 API 호출
    queryFn: ({ signal }) => counselingService.getUpcomingCounseling(signal),

    // 조건부 실행: 인증된 사용자만 실행
    enabled: isAuthenticated && !!user,

    // 캐싱 최적화
    staleTime: 5 * 60 * 1000, // 5분 - 상담 데이터는 자주 변경되지 않음
    gcTime: 10 * 60 * 1000, // 10분 - 메모리에서 제거되는 시간

    // 재요청 설정
    refetchOnWindowFocus: false, // 탭 포커스 시 재요청 방지 (깜빡임 방지)
    refetchOnMount: true, // 컴포넌트 마운트 시에는 최신 데이터 확인
    refetchOnReconnect: true, // 네트워크 재연결 시 재요청

    // 재시도 설정 (QueryClient 기본값 사용)
    retry: 3,

    // 데이터 변환은 필요시에만 사용 (현재는 원본 데이터 사용)
    select: (data: UpcomingCounseling | null) => data,

    // 구조적 공유로 불필요한 리렌더링 방지
    structuralSharing: true,
  });

  // 기존 인터페이스와 호환성을 위한 반환값 매핑
  return {
    // 데이터
    upcomingCounseling: query.data ?? null,

    // 상태
    isLoading: query.isPending, // React Query v5에서는 isPending 사용
    error: query.error?.message ?? null,

    // React Query 고유 상태
    isFetching: query.isFetching,
    isError: query.isError,
    isSuccess: query.isSuccess,

    // 수동 업데이트 함수
    refetch: query.refetch,

    // 추가 유용한 상태들
    dataUpdatedAt: query.dataUpdatedAt,
    errorUpdatedAt: query.errorUpdatedAt,

    // 디버깅용 (개발 환경에서만 사용)
    ...(import.meta.env.DEV && {
      _queryState: query,
    }),
  };
};

/**
 * 타입 정의
 */
export type UseUpcomingCounselingQueryReturn = ReturnType<
  typeof useUpcomingCounselingQuery
>;
