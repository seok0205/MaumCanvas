import { counselingService } from '@/services/counselingService';
import { useAuthStore } from '@/stores/useAuthStore';
import type { UpcomingCounseling } from '@/types/api';
import { AuthenticationError } from '@/types/auth';
import {
  generateUserFriendlyMessage,
  isRetryableError as isErrorRetryable,
} from '@/utils/counselingErrorHandler';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseUpcomingCounselingReturn {
  upcomingCounseling: UpcomingCounseling | null;
  isLoading: boolean;
  error: string | null;
  retryCount: number;
  maxRetries: number;
  refetch: () => Promise<void>;
  isRetrying: boolean;
}

const MAX_RETRIES = 3; // 5에서 3으로 줄임 (더 빠른 실패)
const RETRY_DELAY = 1500; // 2초에서 1.5초로 줄임
const RETRY_BACKOFF_MULTIPLIER = 1.5; // 지수적 백오프

export const useUpcomingCounseling = (): UseUpcomingCounselingReturn => {
  const [upcomingCounseling, setUpcomingCounseling] =
    useState<UpcomingCounseling | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  // 브라우저 환경 호환을 위해 NodeJS.Timeout 대신 반환 타입 추론 사용
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 인증 상태 확인
  const { isAuthenticated, user } = useAuthStore();

  const fetchUpcomingCounseling = useCallback(
    async (isRetry = false): Promise<void> => {
      // 인증되지 않은 경우 API 호출하지 않음
      if (!isAuthenticated || !user) {
        setError('인증이 필요합니다.');
        return;
      }

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
        setIsRetrying(isRetry);

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
          err instanceof AuthenticationError
            ? err.message
            : err instanceof Error
              ? err.message
              : '알 수 없는 오류가 발생했습니다.';

        setError(errorMessage);

        // 재시도 가능한 에러이고 재시도 횟수가 남아있다면 자동 재시도
        if (
          err instanceof AuthenticationError &&
          isErrorRetryable(err) &&
          retryCount < MAX_RETRIES &&
          !isRetry
        ) {
          setRetryCount(prev => prev + 1);

          // (개발 전용 로깅 제거)

          // 지수적 백오프로 지연 후 재시도
          const delay =
            RETRY_DELAY * Math.pow(RETRY_BACKOFF_MULTIPLIER, retryCount);
          timeoutRef.current = setTimeout(() => {
            fetchUpcomingCounseling(true);
          }, delay);
        } else if (err instanceof AuthenticationError) {
          // 재시도할 수 없는 에러인 경우 사용자 친화적 메시지 적용
          const userMessage = generateUserFriendlyMessage(err, {
            retryCount,
            maxRetries: MAX_RETRIES,
          });
          setError(userMessage);
        }
      } finally {
        setIsLoading(false);
        setIsRetrying(false);
      }
    },
    [retryCount, isAuthenticated, user]
  );

  // 수동 재시도 함수
  const refetch = useCallback(async (): Promise<void> => {
    setRetryCount(0); // 수동 재시도 시 카운트 리셋
    await fetchUpcomingCounseling();
  }, [fetchUpcomingCounseling]);

  // 컴포넌트 마운트 시 초기 로드 (인증 상태 확인 후)
  useEffect(() => {
    // 인증된 상태에서만 API 호출
    if (isAuthenticated && user) {
      fetchUpcomingCounseling();
    }

    // 컴포넌트 언마운트 시 요청 취소 및 타이머 정리
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [fetchUpcomingCounseling, isAuthenticated, user]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    upcomingCounseling,
    isLoading,
    error,
    retryCount,
    maxRetries: MAX_RETRIES,
    refetch,
    isRetrying,
  };
};
