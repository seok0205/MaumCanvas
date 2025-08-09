import { useCallback, useRef } from 'react';

interface UsePreventDoubleClickReturn {
  isBlocked: boolean;
  preventDoubleClick: <T extends (...args: any[]) => any>(
    callback: T
  ) => (...args: Parameters<T>) => void;
}

export const usePreventDoubleClick = (
  delay = 1000
): UsePreventDoubleClickReturn => {
  const isBlockedRef = useRef(false);
  // Node/브라우저 환경 모두 호환되도록 반환 타입 추론 사용
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const preventDoubleClick = useCallback(
    <T extends (...args: any[]) => any>(callback: T) => {
      return (...args: Parameters<T>): void => {
        if (isBlockedRef.current) {
          return;
        }

        isBlockedRef.current = true;

        // 이전 타이머가 있다면 클리어
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // 콜백 실행
        callback(...args);

        // 지정된 시간 후에 블록 해제
        timeoutRef.current = setTimeout(() => {
          isBlockedRef.current = false;
        }, delay);
      };
    },
    [delay]
  );

  return {
    isBlocked: isBlockedRef.current,
    preventDoubleClick,
  };
};
