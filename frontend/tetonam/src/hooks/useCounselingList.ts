import { counselingService } from '@/services/counselingService';
import type { CounselingHistory } from '@/types/api';
import { useQuery } from '@tanstack/react-query';

export const useCounselorCounselingList = <T = CounselingHistory[]>(
  select?: (data: CounselingHistory[]) => T
) => {
  const query = useQuery<CounselingHistory[], Error, T>({
    queryKey: ['counseling', 'list', 'counselor'],
    queryFn: ({ signal }) =>
      counselingService.getMyCounselingListForCounselor(signal),
    
    // select 옵션으로 데이터 변환 및 부분 구독 지원
    select: select || ((data) => data as T),
    
    // 캐싱 최적화
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    
    // 구조적 공유로 참조 최적화
    structuralSharing: true,
  });
  
  return {
    data: query.data,
    items: query.data ?? ([] as unknown as T), // 하위 호환성 유지
    isLoading: query.isPending && !query.data,
    isFetching: query.isFetching,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
  };
};

export const useStudentCounselingList = () => {
  const query = useQuery<CounselingHistory[]>({
    queryKey: ['counseling', 'list', 'student'],
    queryFn: ({ signal }) =>
      counselingService.getMyCounselingListForStudent(signal),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  return {
    items: query.data ?? [],
    isLoading: query.isPending && !query.data,
    isFetching: query.isFetching,
    error: query.error ? (query.error as Error).message : null,
    refetch: query.refetch,
  };
};
