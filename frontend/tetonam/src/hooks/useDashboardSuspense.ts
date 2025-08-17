import { useQueries, useSuspenseQueries, keepPreviousData } from '@tanstack/react-query';
import { counselingService } from '@/services/counselingService';
import { getAllCategoriesQuestionnaireResults } from '@/services/questionnaireService';
import { userService } from '@/services/userService';
import { useAuthStore } from '@/stores/useAuthStore';
import type { MainMyInfoResponse, UpcomingCounseling } from '@/types/api';
import type { QuestionnaireCategory } from '@/types/api';

// 쿼리 키 상수 
const DASHBOARD_SUSPENSE_QUERY_KEYS = {
  USER_HOME_INFO: ['user', 'home-my-info'] as const,
  UPCOMING_COUNSELING: (userId?: string | number) => ['counseling', 'upcoming', userId] as const,
  QUESTIONNAIRE_RESULTS: (categories: QuestionnaireCategory[]) => 
    ['questionnaire-results', categories] as const,
} as const;

const QUESTIONNAIRE_CATEGORIES: QuestionnaireCategory[] = [
  '스트레스',
  '우울', 
  '불안',
  '자살',
];

interface DashboardSuspenseData {
  userInfo: MainMyInfoResponse;
  counseling: UpcomingCounseling | null;
  questionnaire: Record<string, any>;
}

/**
 * Suspense 기반 대시보드 데이터 로딩 훅
 * 
 * TanStack Query v5 useSuspenseQueries 사용
 * - 데이터가 로딩될 때까지 컴포넌트 suspend
 * - 모든 데이터가 준비되면 한번에 렌더링
 * - 선언적 로딩/에러 상태 관리
 * 
 * 사용법:
 * ```tsx
 * <Suspense fallback={<DashboardSkeleton />}>
 *   <ErrorBoundary fallback={<ErrorFallback />}>
 *     <DashboardContent />
 *   </ErrorBoundary>
 * </Suspense>
 * ```
 */
export const useDashboardSuspenseQueries = (): DashboardSuspenseData => {
  const { user } = useAuthStore();

  const [userQuery, counselingQuery, questionnaireQuery] = useSuspenseQueries({
    queries: [
      {
        queryKey: DASHBOARD_SUSPENSE_QUERY_KEYS.USER_HOME_INFO,
        queryFn: ({ signal }: { signal?: AbortSignal }) => 
          userService.getHomeMyInfo(signal),
        staleTime: 10 * 60 * 1000, // 10분
        gcTime: 30 * 60 * 1000, // 30분
        retry: (failureCount: number, error: unknown) => {
          if (error instanceof Error && error.message.includes('Network Error')) {
            return failureCount < 3;
          }
          return false;
        },
        retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      {
        queryKey: DASHBOARD_SUSPENSE_QUERY_KEYS.UPCOMING_COUNSELING(user?.id),
        queryFn: ({ signal }: { signal?: AbortSignal }) => 
          counselingService.getUpcomingCounseling(signal),
        staleTime: 5 * 60 * 1000, // 5분
        gcTime: 10 * 60 * 1000, // 10분
        retry: 3,
        retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      {
        queryKey: DASHBOARD_SUSPENSE_QUERY_KEYS.QUESTIONNAIRE_RESULTS(QUESTIONNAIRE_CATEGORIES),
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
        staleTime: 15 * 60 * 1000, // 15분
        gcTime: 60 * 60 * 1000, // 1시간
        retry: 5,
        retryDelay: 2000,
      },
    ],
  });

  // useSuspenseQueries는 데이터가 항상 정의됨을 보장
  return {
    userInfo: userQuery.data,
    counseling: counselingQuery.data,
    questionnaire: questionnaireQuery.data,
  };
};

/**
 * 프로그레시브 로딩 - 우선순위 기반 데이터 로딩
 * 
 * 중요한 데이터(사용자 정보)를 먼저 로딩하고,
 * 부가적인 데이터는 백그라운드에서 로딩
 */
export const useDashboardProgressiveLoading = () => {
  const { isAuthenticated, user } = useAuthStore();

  // 1단계: 필수 데이터 (사용자 정보) 먼저 로딩
  const userInfoQuery = useQueries({
    queries: [{
      queryKey: DASHBOARD_SUSPENSE_QUERY_KEYS.USER_HOME_INFO,
      queryFn: ({ signal }: { signal?: AbortSignal }) => 
        userService.getHomeMyInfo(signal),
      enabled: isAuthenticated && !!user,
      staleTime: 10 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      placeholderData: keepPreviousData,
    }],
    combine: (results) => results[0],
  });

  // 2단계: 부가 데이터 (상담, 설문) 병렬 로딩 
  const secondaryDataQueries = useQueries({
    queries: [
      {
        queryKey: DASHBOARD_SUSPENSE_QUERY_KEYS.UPCOMING_COUNSELING(user?.id),
        queryFn: ({ signal }: { signal?: AbortSignal }) => 
          counselingService.getUpcomingCounseling(signal),
        enabled: isAuthenticated && !!user && !!userInfoQuery.data, // 사용자 정보 로딩 후 실행
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        placeholderData: keepPreviousData,
      },
      {
        queryKey: DASHBOARD_SUSPENSE_QUERY_KEYS.QUESTIONNAIRE_RESULTS(QUESTIONNAIRE_CATEGORIES),
        queryFn: async () => {
          const raw = await getAllCategoriesQuestionnaireResults(
            QUESTIONNAIRE_CATEGORIES as unknown as any[]
          );
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
        enabled: isAuthenticated && !!user && !!userInfoQuery.data, // 사용자 정보 로딩 후 실행
        staleTime: 15 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        placeholderData: keepPreviousData,
      },
    ],
    combine: (results) => ({
      counseling: results[0]?.data ?? null,
      questionnaire: results[1]?.data ?? null,
      isSecondaryLoading: results.some(r => r.isPending),
      isSecondaryError: results.some(r => r.isError),
    }),
  });

  return {
    // 1단계 데이터
    userInfo: userInfoQuery.data ?? null,
    isUserInfoLoading: userInfoQuery.isPending,
    isUserInfoError: userInfoQuery.isError,
    
    // 2단계 데이터
    counseling: secondaryDataQueries.counseling,
    questionnaire: secondaryDataQueries.questionnaire,
    isSecondaryLoading: secondaryDataQueries.isSecondaryLoading,
    isSecondaryError: secondaryDataQueries.isSecondaryError,
    
    // 전체 상태
    isLoading: userInfoQuery.isPending || secondaryDataQueries.isSecondaryLoading,
    isError: userInfoQuery.isError || secondaryDataQueries.isSecondaryError,
    
    // 리페치 함수
    refetchAll: () => {
      userInfoQuery.refetch();
      // 2단계 데이터도 개별적으로 리페치 가능
    },
  };
};

// Query Keys 내보내기
export { DASHBOARD_SUSPENSE_QUERY_KEYS };
