import { useEffect, useState } from 'react';

/**
 * 지연된 로딩 상태를 관리하는 커스텀 훅
 *
 * RAIL 모델 기반: 500ms 지연으로 불필요한 로딩 깜빡임 방지
 * - 빠른 API 응답(< 500ms): 로딩 상태 표시 안함
 * - 느린 API 응답(> 500ms): 부드럽게 로딩 상태 표시
 *
 * @param isLoading - 실제 로딩 상태
 * @param delay - 지연 시간 (기본값: 300ms)
 * @returns 지연된 로딩 상태
 */
export const useDelayedLoading = (
  isLoading: boolean,
  delay: number = 500
): boolean => {
  const [delayedLoading, setDelayedLoading] = useState(false);

  useEffect(() => {
    let timeoutId: number;

    if (isLoading) {
      // 로딩이 시작되면 지연 시간 후 상태 업데이트
      timeoutId = window.setTimeout(() => {
        setDelayedLoading(true);
      }, delay);
    } else {
      // 로딩이 끝나면 즉시 상태 업데이트
      setDelayedLoading(false);
    }

    // Cleanup: 컴포넌트 언마운트 또는 로딩 상태 변경 시 타이머 정리
    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [isLoading, delay]);

  return delayedLoading;
};

/**
 * Progressive Loading을 위한 고급 로딩 상태 훅
 *
 * React Query의 다양한 상태를 조합하여 최적의 UX 제공:
 * - initialLoading: 처음 데이터를 가져올 때만 스켈레톤 표시
 * - backgroundLoading: 백그라운드 업데이트 시 작은 인디케이터
 * - delayedLoading: 지연된 로딩으로 깜빡임 방지
 * - minDisplayTime: 스켈레톤 최소 표시 시간 보장으로 급작스러운 전환 방지
 */
export interface ProgressiveLoadingState {
  /** 지연된 초기 로딩 상태 (스켈레톤 UI용) */
  showSkeleton: boolean;
  /** 백그라운드 페칭 상태 (작은 로딩 인디케이터용) */
  isBackgroundFetching: boolean;
  /** 데이터 존재 여부 */
  hasData: boolean;
  /** 에러 상태 */
  hasError: boolean;
}

export const useProgressiveLoading = ({
  isLoading,
  isFetching,
  data,
  error,
  delay = 500,
  minDisplayTime = 800,
}: {
  isLoading: boolean;
  isFetching: boolean;
  data: any;
  error: any;
  delay?: number;
  minDisplayTime?: number;
}): ProgressiveLoadingState => {
  const [skeletonStartTime, setSkeletonStartTime] = useState<number | null>(
    null
  );
  const [canShowFinalState, setCanShowFinalState] = useState(false);

  const delayedLoading = useDelayedLoading(isLoading, delay);

  // 스켈레톤이 표시되기 시작할 때 시작 시간 기록
  useEffect(() => {
    if (delayedLoading && !data && skeletonStartTime === null) {
      setSkeletonStartTime(Date.now());
      setCanShowFinalState(false);
    }
  }, [delayedLoading, data, skeletonStartTime]);

  // 최소 표시 시간 경과 체크
  useEffect(() => {
    if (skeletonStartTime && (!isLoading || data || error)) {
      const elapsed = Date.now() - skeletonStartTime;
      const remainingTime = Math.max(0, minDisplayTime - elapsed);

      if (remainingTime > 0) {
        const timeoutId = window.setTimeout(() => {
          setCanShowFinalState(true);
          setSkeletonStartTime(null);
        }, remainingTime);

        return () => window.clearTimeout(timeoutId);
      } else {
        setCanShowFinalState(true);
        setSkeletonStartTime(null);
      }
    }

    // 모든 경우에 cleanup 함수 반환 (빈 함수라도)
    return () => {};
  }, [skeletonStartTime, isLoading, data, error, minDisplayTime]);

  // 스켈레톤을 표시할지 결정
  const shouldShowSkeleton = !data && delayedLoading && !canShowFinalState;

  return {
    // 데이터가 없고 로딩 중일 때만 스켈레톤 표시 (지연 + 최소 표시 시간 적용)
    showSkeleton: shouldShowSkeleton,

    // 데이터가 있지만 백그라운드에서 업데이트 중
    isBackgroundFetching: !!data && isFetching,

    // 데이터 존재 여부
    hasData: !!data,

    // 에러 상태
    hasError: !!error,
  };
};
