import { useCallback, useEffect, useRef } from 'react';

/**
 * 자동저장 커스텀 훅
 *
 * 사용자가 일정 시간 동안 활동을 멈추면 자동으로 저장 함수를 실행합니다.
 * debouncing을 활용하여 성능을 최적화하고 불필요한 저장을 방지합니다.
 */
export const useAutoSave = (
  saveFunction: () => Promise<void> | void,
  delay: number = 30000, // 30초
  dependencies: React.DependencyList = []
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isEnabledRef = useRef(true);

  // 자동저장 실행
  const executeSave = useCallback(async () => {
    if (!isEnabledRef.current) return;

    try {
      await saveFunction();
    } catch (error) {
      console.warn('Auto save failed:', error);
    }
  }, [saveFunction]);

  // 타이머 설정
  const scheduleAutoSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      executeSave();
    }, delay);
  }, [executeSave, delay]);

  // 타이머 취소
  const cancelAutoSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // 자동저장 활성화/비활성화
  const setEnabled = useCallback(
    (enabled: boolean) => {
      isEnabledRef.current = enabled;
      if (!enabled) {
        cancelAutoSave();
      }
    },
    [cancelAutoSave]
  );

  // 수동으로 자동저장 트리거
  const triggerAutoSave = useCallback(() => {
    if (isEnabledRef.current) {
      scheduleAutoSave();
    }
  }, [scheduleAutoSave]);

  // dependencies가 변경될 때마다 타이머 재설정
  useEffect(() => {
    if (isEnabledRef.current) {
      scheduleAutoSave();
    }
    return cancelAutoSave;
  }, [...dependencies, scheduleAutoSave, cancelAutoSave]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      cancelAutoSave();
    };
  }, [cancelAutoSave]);

  return {
    triggerAutoSave,
    cancelAutoSave,
    setEnabled,
    isEnabled: isEnabledRef.current,
  };
};
