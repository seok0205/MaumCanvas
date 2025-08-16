import { counselingService } from '@/services/counselingService';
import { getAllCategoriesQuestionnaireResults } from '@/services/questionnaireService';
import { userService } from '@/services/userService';
import { useAuthStore } from '@/stores/useAuthStore';
import type { MainMyInfoResponse, UpcomingCounseling } from '@/types/api';
import type { QuestionnaireCategory } from '@/types/api';
import { useQueries, keepPreviousData } from '@tanstack/react-query';
import { useMemo, useEffect } from 'react';

// 쿼리 키 상수
const DASHBOARD_QUERY_KEYS = {
  USER_HOME_INFO: ['user', 'home-my-info'] as const,
  UPCOMING_COUNSELING: (userId?: string | number) => ['counseling', 'upcoming', userId] as const,
  QUESTIONNAIRE_RESULTS: (categories: QuestionnaireCategory[]) => 
    ['questionnaire-results', categories] as const,
} as const;

// 설문조사 카테고리 상수
const QUESTIONNAIRE_CATEGORIES: QuestionnaireCategory[] = [
  '스트레스',
  '우울', 
  '불안',
  '자살',
];

interface DashboardData {
  userInfo: MainMyInfoResponse | null;
  counseling: UpcomingCounseling | null;
  questionnaire: Record<string, any> | null;
}

interface DashboardState {
  data: DashboardData;
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  hasError: boolean;
  errors: (Error | null)[];
  refetchAll: () => void;
}

/**
 * 대시보드 병렬 데이터 로딩 훅
 * 
 * TanStack Query v5 Best Practice:
 * - useQueries로 독립적 데이터 소스 병렬 로딩
 * - combine 옵션으로 쿼리 결과 집계
 * - placeholderData로 매끄러운 전환
 * - 조건부 쿼리 실행으로 성능 최적화
 * 
 * 개선 사항:
 * - 이전 병렬 로딩 대비 request waterfall 제거
 * - LCP 개선: 가장 빠른 데이터부터 렌더링 가능
 * - 통일된 로딩 상태 관리
 */
export const useDashboardData = (): DashboardState => {
  const { isAuthenticated, user, updateUserProfile } = useAuthStore();

  // useQueries를 사용한 병렬 데이터 페칭
  const queries = useMemo(() => [
    {
      queryKey: DASHBOARD_QUERY_KEYS.USER_HOME_INFO,
      queryFn: ({ signal }: { signal?: AbortSignal }) => 
        userService.getHomeMyInfo(signal),
      enabled: isAuthenticated && !!user,
      staleTime: 10 * 60 * 1000, // 10분
      gcTime: 30 * 60 * 1000, // 30분
      placeholderData: keepPreviousData,
      refetchOnWindowFocus: true,
      retry: (failureCount: number, error: Error) => {
        if (error.message.includes('Network Error')) {
          return failureCount < 3;
        }
        return false;
      },
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    {
      queryKey: DASHBOARD_QUERY_KEYS.UPCOMING_COUNSELING(user?.id),
      queryFn: ({ signal }: { signal?: AbortSignal }) => 
        counselingService.getUpcomingCounseling(signal),
      enabled: isAuthenticated && !!user,
      staleTime: 5 * 60 * 1000, // 5분 - 상담 데이터는 더 자주 업데이트
      gcTime: 10 * 60 * 1000, // 10분
      placeholderData: keepPreviousData,
      refetchOnWindowFocus: false, // 상담 데이터는 탭 포커스 시 재요청 방지
      retry: 3,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    {
      queryKey: DASHBOARD_QUERY_KEYS.QUESTIONNAIRE_RESULTS(QUESTIONNAIRE_CATEGORIES),
      queryFn: async () => {
        const raw = await getAllCategoriesQuestionnaireResults(
          QUESTIONNAIRE_CATEGORIES as unknown as any[]
        );
        // 정규화된 결과 반환
        const normalized: Record<string, any> = {};
        Object.entries(raw).forEach(([k, arr]) => {
          normalized[k] = (arr as any[]).map(item => ({
            category: k,
            score: typeof item.score === 'number' 
              ? item.score 
              : parseInt(item.score, 10) || 0,
            createdDate: item.createdDate,
          }));
        });
        return normalized;
      },
      enabled: isAuthenticated && !!user,
      staleTime: 15 * 60 * 1000, // 15분 - 설문조사 결과는 더 긴 캐시
      gcTime: 60 * 60 * 1000, // 1시간
      placeholderData: keepPreviousData,
      refetchOnWindowFocus: false,
      retry: (failureCount: number) => {
        if (failureCount < 5) return true;
        return false;
      },
      retryDelay: 2000,
    },
  ], [isAuthenticated, user]);

  // useQueries로 병렬 실행 및 combine으로 결과 집계
  const result = useQueries({
    queries,
    combine: (results) => {
      const userQuery = results[0];
      const counselingQuery = results[1];
      const questionnaireQuery = results[2];
      
      // 🎯 TanStack Query 결과를 authStore에 동기화
      if (userQuery?.data && userQuery.isSuccess) {
        const userInfo = userQuery.data as MainMyInfoResponse;
        updateUserProfile({
          name: userInfo.name || '',
          nickname: userInfo.nickname || '',
          // ✅ 기존 ID가 있으면 유지, 없을 때만 새로 설정
          ...((!user?.id || user.id === '') && {
            id: userInfo.id?.toString() || userInfo.userId?.toString() || '',
          }),
        });
      }
      
      return {
        data: {
          userInfo: userQuery?.data ?? null,
          counseling: counselingQuery?.data ?? null,
          questionnaire: questionnaireQuery?.data ?? null,
        } as DashboardData,
        isLoading: results.some(result => result.isPending && !result.data),
        isError: results.some(result => result.isError),
        isFetching: results.some(result => result.isFetching),
        hasError: results.some(result => result.isError),
        errors: results.map(result => result.error),
        refetchAll: () => {
          results.forEach(result => result.refetch());
        },
      };
    },
  });

  return result;
};

/**
 * Suspense 기반 대시보드 데이터 훅
 * 
 * TanStack Query v5 useSuspenseQueries 사용
 * 선언적 로딩 상태 관리를 원할 때 사용
 * Suspense boundary와 Error boundary가 필요함
 */
export const useDashboardDataSuspense = () => {
  const { isAuthenticated, user } = useAuthStore();

  // 인증되지 않은 경우 빈 데이터 반환
  if (!isAuthenticated || !user) {
    return {
      data: {
        userInfo: null,
        counseling: null,
        questionnaire: null,
      } as DashboardData,
      refetchAll: () => {},
    };
  }

  // useSuspenseQueries는 향후 구현 예정
  // 현재는 일반 useQueries 사용을 권장
  const result = useDashboardData();
  
  return {
    data: result.data,
    refetchAll: result.refetchAll,
  };
};

// Query Keys 내보내기 (캐시 무효화 시 사용)
export { DASHBOARD_QUERY_KEYS };
