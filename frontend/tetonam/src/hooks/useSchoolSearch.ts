import { schoolService } from '@/services/schoolService';
import type { School } from '@/types/school';
import { useQuery } from '@tanstack/react-query';

export function useSchoolSearch(query: string) {
  return useQuery<School[], Error>({
    queryKey: ['schools', 'search', query.toLowerCase().trim()],
    queryFn: () => schoolService.searchSchool(query),
    enabled: query.length >= 2, // 2글자 이상일 때만 실행
    staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
    gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    select: data => data.slice(0, 10), // 최대 10개 결과만 반환
  });
}
