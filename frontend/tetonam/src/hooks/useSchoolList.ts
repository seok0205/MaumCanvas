import { schoolService } from '@/services/schoolService';
import type { School } from '@/types/school';
import { useQuery } from '@tanstack/react-query';

export function useSchoolList() {
  return useQuery<School[], Error>({
    queryKey: ['schools', 'all'],
    queryFn: () => schoolService.getSchoolList(),
    staleTime: 10 * 60 * 1000, // 10분간 fresh 상태 유지
    gcTime: 30 * 60 * 1000, // 30분간 캐시 유지
    retry: 2,
    retryDelay: 1000,
  });
}
