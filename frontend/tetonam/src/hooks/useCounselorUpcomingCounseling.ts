import { counselingService } from '@/services/counselingService';
import { useAuthStore } from '@/stores/useAuthStore';
import type { UpcomingCounseling } from '@/types/api';
import { AuthenticationError } from '@/types/auth';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseCounselorUpcomingReturn {
  upcoming: UpcomingCounseling | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// 상담사 전용 다가오는 상담 1건 조회 (백엔드 전용 엔드포인트 준비 전까지 학생 API 재사용)
export const useCounselorUpcomingCounseling =
  (): UseCounselorUpcomingReturn => {
    const { isAuthenticated, user } = useAuthStore();
    const [upcoming, setUpcoming] = useState<UpcomingCounseling | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const fetchData = useCallback(async () => {
      if (!isAuthenticated || !user) {
        setError('인증이 필요합니다.');
        return;
      }
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      try {
        setIsLoading(true);
        setError(null);
        const result = await counselingService.getCounselorUpcomingCounseling(
          abortRef.current.signal
        );
        setUpcoming(result);
      } catch (e) {
        if (e instanceof AuthenticationError && e.code === 'ABORTED') return;
        setError(
          e instanceof AuthenticationError
            ? e.message
            : '조회 중 오류가 발생했습니다.'
        );
      } finally {
        setIsLoading(false);
      }
    }, [isAuthenticated, user]);

    useEffect(() => {
      if (isAuthenticated && user) {
        fetchData();
      }
      return () => {
        if (abortRef.current) abortRef.current.abort();
      };
    }, [fetchData, isAuthenticated, user]);

    const refetch = useCallback(async () => {
      await fetchData();
    }, [fetchData]);

    return { upcoming, isLoading, error, refetch };
  };
