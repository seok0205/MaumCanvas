import { counselingService } from '@/services/counselingService';
import type { CounselingHistory } from '@/types/api';
import { useQuery } from '@tanstack/react-query';

export const useCounselorCounselingList = () => {
  const query = useQuery<CounselingHistory[]>({
    queryKey: ['counseling', 'list', 'counselor'],
    queryFn: ({ signal }) =>
      counselingService.getMyCounselingListForCounselor(signal),
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
