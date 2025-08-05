import { schoolService } from '@/services/schoolService';
import type { School, SchoolSearchError } from '@/types/school';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

export function useSchoolSearch(query: string) {
  // 안정적인 쿼리 키 생성
  const stableQuery = useMemo(() => query.toLowerCase().trim(), [query]);

  // 안정적인 쿼리 키
  const queryKey = useMemo(
    () => ['schools', 'search', stableQuery],
    [stableQuery]
  );

  return useQuery<School[], SchoolSearchError>({
    queryKey,
    queryFn: async () => {
      // 빈 쿼리 처리
      if (stableQuery.length < 2) {
        return [];
      }

      try {
        return await schoolService.searchSchool(stableQuery);
      } catch (error) {
        // 에러를 SchoolSearchError로 변환하여 일관된 에러 처리
        if (error && typeof error === 'object' && 'code' in error) {
          throw error as SchoolSearchError;
        }

        const searchError: SchoolSearchError = {
          code: 'UNKNOWN_ERROR',
          message: '학교 검색에 실패했습니다.',
          originalError: error,
        };
        throw searchError;
      }
    },
    enabled: stableQuery.length >= 2, // 2글자 이상일 때만 실행
    staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
    gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
    retry: (failureCount, error) => {
      // 네트워크 에러가 아닌 경우 재시도하지 않음
      if (error && typeof error === 'object' && 'code' in error) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    select: data => data.slice(0, 10), // 최대 10개 결과만 반환
    // 에러가 발생해도 UI에 표시하지 않도록 설정
    throwOnError: false,
  });
}
