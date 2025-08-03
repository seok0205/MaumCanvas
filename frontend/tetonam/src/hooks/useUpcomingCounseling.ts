import { counselingService } from '@/services/counselingService';
import type { UpcomingCounseling } from '@/types/api';
import { AuthenticationError } from '@/types/auth';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseUpcomingCounselingReturn {
  upcomingCounseling: UpcomingCounseling | null;
  isLoading: boolean;
  error: string | null;
  retryCount: number;
  maxRetries: number;
  refetch: () => Promise<void>;
}

const MAX_RETRIES = 5;
const RETRY_DELAY = 2000; // 2초

export const useUpcomingCounseling = (): UseUpcomingCounselingReturn => {
  const [upcomingCounseling, setUpcomingCounseling] =
    useState<UpcomingCounseling | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchUpcomingCounseling = useCallback(
    async (isRetry = false): Promise<void> => {
      // 이전 요청이 있다면 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // 이전 타이머가 있다면 취소
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // 새로운 AbortController 생성
      abortControllerRef.current = new AbortController();

      try {
        setIsLoading(true);
        setError(null);

        const result = await counselingService.getUpcomingCounseling(
          abortControllerRef.current.signal
        );

        setUpcomingCounseling(result);
        setRetryCount(0); // 성공 시 재시도 카운트 리셋
      } catch (err) {
        if (err instanceof AuthenticationError && err.code === 'ABORTED') {
          // 요청이 취소된 경우는 에러로 처리하지 않음
          return;
        }

        const errorMessage =
          err instanceof Error
            ? err.message
            : '알 수 없는 오류가 발생했습니다.';
        setError(errorMessage);

        // 네트워크 에러이고 재시도 횟수가 남아있다면 자동 재시도
        if (
          err instanceof AuthenticationError &&
          (err.code === 'NETWORK_ERROR' || err.code === 'ERR_NETWORK') &&
          retryCount < MAX_RETRIES &&
          !isRetry
        ) {
          setRetryCount(prev => prev + 1);

          // 지연 후 재시도 (타이머 참조 저장)
          timeoutRef.current = setTimeout(() => {
            fetchUpcomingCounseling(true);
          }, RETRY_DELAY);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [retryCount]
  );

  // 수동 재시도 함수
  const refetch = useCallback(async (): Promise<void> => {
    setRetryCount(0); // 수동 재시도 시 카운트 리셋
    await fetchUpcomingCounseling();
  }, [fetchUpcomingCounseling]);

  // 컴포넌트 마운트 시 초기 로드
  useEffect(() => {
    fetchUpcomingCounseling();

    // 컴포넌트 언마운트 시 요청 취소 및 타이머 정리
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [fetchUpcomingCounseling]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    upcomingCounseling,
    isLoading,
    error,
    retryCount,
    maxRetries: MAX_RETRIES,
    refetch,
  };
};
