import { useCallback, useEffect, useRef } from 'react';

import { useDrawingStore } from '@/stores/useDrawingStore';

interface MemoryOptimizationOptions {
  maxLinesPerStep?: number;
  maxHistoryEntries?: number;
  memoryCheckInterval?: number;
  autoCleanup?: boolean;
}

/**
 * 태블릿 PWA 환경을 위한 메모리 최적화 훅
 * - 그리기 데이터 자동 정리
 * - 메모리 사용량 모니터링
 * - 가비지 컬렉션 유도
 */
export const useMemoryOptimization = (
  options: MemoryOptimizationOptions = {}
) => {
  const {
    maxLinesPerStep = 1000,
    maxHistoryEntries = 10,
    memoryCheckInterval = 30000, // 30초
    autoCleanup = true,
  } = options;

  const { stepsLines, setStepsLines } = useDrawingStore();
  const memoryCheckRef = useRef<number | undefined>(undefined);
  const lastCleanupRef = useRef<number>(Date.now());

  /**
   * 메모리 사용량 추정 (대략적)
   */
  const estimateMemoryUsage = useCallback((): number => {
    try {
      // 그리기 데이터 크기 계산
      const drawingDataSize = stepsLines.reduce((total, stepLines) => {
        return (
          total +
          stepLines.reduce((stepTotal, line) => {
            return stepTotal + line.points.length * 8; // 각 포인트는 약 8바이트
          }, 0)
        );
      }, 0);

      // 로컬 스토리지 크기 계산
      let localStorageSize = 0;
      try {
        for (const key in localStorage) {
          if (localStorage.hasOwnProperty(key)) {
            localStorageSize += localStorage[key].length;
          }
        }
      } catch (error) {
        console.warn('Failed to calculate localStorage size:', error);
      }

      return drawingDataSize + localStorageSize;
    } catch (error) {
      console.warn('Failed to estimate memory usage:', error);
      return 0;
    }
  }, [stepsLines]);

  /**
   * 과도한 선 데이터 정리
   */
  const cleanupExcessiveLines = useCallback(() => {
    try {
      const cleanedStepsLines = stepsLines.map(stepLines => {
        if (stepLines.length > maxLinesPerStep) {
          console.warn(
            `Step has ${stepLines.length} lines, trimming to ${maxLinesPerStep}`
          );
          return stepLines.slice(-maxLinesPerStep); // 최신 선들만 유지
        }
        return stepLines;
      });

      // 변경사항이 있는 경우에만 업데이트
      const hasChanges = cleanedStepsLines.some((stepLines, index) => {
        const originalStep = stepsLines[index];
        return originalStep && stepLines.length !== originalStep.length;
      });

      if (hasChanges) {
        setStepsLines(cleanedStepsLines);
      }
    } catch (error) {
      console.error('Failed to cleanup excessive lines:', error);
    }
  }, [stepsLines, maxLinesPerStep, setStepsLines]);

  /**
   * 로컬 스토리지 정리
   */
  const cleanupLocalStorage = useCallback(() => {
    try {
      const keys = Object.keys(localStorage);
      const drawingKeys = keys.filter(
        key => key.startsWith('drawing_') || key.startsWith('canvas_')
      );

      // 오래된 데이터 삭제
      if (drawingKeys.length > maxHistoryEntries) {
        const keysToDelete = drawingKeys
          .sort()
          .slice(0, drawingKeys.length - maxHistoryEntries);

        keysToDelete.forEach(key => {
          localStorage.removeItem(key);
        });
      }

      // 임시 데이터 정리 (1시간 이상 된 것)
      const tempKeys = keys.filter(key => key.startsWith('temp_'));
      const oneHourAgo = Date.now() - 60 * 60 * 1000;

      tempKeys.forEach(key => {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          if (data.timestamp && data.timestamp < oneHourAgo) {
            localStorage.removeItem(key);
          }
        } catch (parseError) {
          // 파싱 실패한 임시 데이터는 삭제
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to cleanup localStorage:', error);
    }
  }, [maxHistoryEntries]);

  /**
   * 가비지 컬렉션 유도
   */
  const triggerGarbageCollection = useCallback(() => {
    try {
      // 브라우저가 gc를 지원하는 경우 호출
      if ('gc' in window && typeof (window as any).gc === 'function') {
        (window as any).gc();
      }

      // 메모리 압박 시뮬레이션 (브라우저 최적화 유도)
      if ('performance' in window && 'memory' in performance) {
        const memInfo = (performance as any).memory;
        if (memInfo.usedJSHeapSize > memInfo.totalJSHeapSize * 0.8) {
          console.warn('High memory usage detected:', memInfo);
        }
      }
    } catch (error) {
      console.warn('Failed to trigger garbage collection:', error);
    }
  }, []);

  /**
   * 전체 메모리 정리 실행
   */
  const performMemoryCleanup = useCallback(() => {
    const now = Date.now();

    // 너무 자주 정리하지 않도록 제한 (최소 5분 간격)
    if (now - lastCleanupRef.current < 5 * 60 * 1000) {
      return;
    }

    cleanupExcessiveLines();
    cleanupLocalStorage();
    triggerGarbageCollection();

    lastCleanupRef.current = now;
  }, [cleanupExcessiveLines, cleanupLocalStorage, triggerGarbageCollection]);

  /**
   * 메모리 상태 체크
   */
  const checkMemoryStatus = useCallback(() => {
    try {
      const estimatedUsage = estimateMemoryUsage();
      const threshold = 50 * 1024 * 1024; // 50MB

      if (estimatedUsage > threshold) {
        console.warn(
          `High memory usage detected: ${(estimatedUsage / 1024 / 1024).toFixed(2)}MB`
        );
        performMemoryCleanup();
      }

      // Performance API 사용 가능한 경우 실제 메모리 체크
      if ('performance' in window && 'memory' in performance) {
        const memInfo = (performance as any).memory;
        if (memInfo.usedJSHeapSize > memInfo.totalJSHeapSize * 0.9) {
          console.warn('Critical memory usage detected, forcing cleanup');
          performMemoryCleanup();
        }
      }
    } catch (error) {
      console.error('Failed to check memory status:', error);
    }
  }, [estimateMemoryUsage, performMemoryCleanup]);

  /**
   * 주기적 메모리 체크 설정
   */
  useEffect(() => {
    if (!autoCleanup) return;

    memoryCheckRef.current = window.setInterval(
      checkMemoryStatus,
      memoryCheckInterval
    );

    return () => {
      if (memoryCheckRef.current) {
        clearInterval(memoryCheckRef.current);
      }
    };
  }, [autoCleanup, memoryCheckInterval, checkMemoryStatus]);

  /**
   * 컴포넌트 언마운트 시 정리
   */
  useEffect(() => {
    return () => {
      // 언마운트 시 한 번 더 정리
      if (autoCleanup) {
        performMemoryCleanup();
      }
    };
  }, [autoCleanup, performMemoryCleanup]);

  return {
    estimateMemoryUsage,
    performMemoryCleanup,
    checkMemoryStatus,
    cleanupExcessiveLines,
    cleanupLocalStorage,
  };
};
