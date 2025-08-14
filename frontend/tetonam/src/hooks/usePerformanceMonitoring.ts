import { useCallback, useEffect, useRef } from 'react';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  touchLatency: number;
}

/**
 * 태블릿 PWA 환경에서의 성능 모니터링 훅
 * - FPS 측정
 * - 메모리 사용량 추적
 * - 터치 레이턴시 측정
 * - 성능 경고 및 최적화 제안
 */
export const usePerformanceMonitoring = () => {
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsRef = useRef(60);
  const touchStartTimeRef = useRef<number>(0);
  const performanceDataRef = useRef<PerformanceMetrics[]>([]);

  /**
   * FPS 측정
   */
  const measureFPS = useCallback(() => {
    const now = performance.now();
    frameCountRef.current++;

    if (now - lastTimeRef.current >= 1000) {
      fpsRef.current = Math.round(
        (frameCountRef.current * 1000) / (now - lastTimeRef.current)
      );
      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }

    requestAnimationFrame(measureFPS);
  }, []);

  /**
   * 메모리 사용량 측정
   */
  const getMemoryUsage = useCallback((): number => {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      return memInfo.usedJSHeapSize / 1024 / 1024; // MB 단위
    }
    return 0;
  }, []);

  /**
   * 터치 레이턴시 측정 시작
   */
  const startTouchLatencyMeasurement = useCallback(() => {
    touchStartTimeRef.current = performance.now();
  }, []);

  /**
   * 터치 레이턴시 측정 종료
   */
  const endTouchLatencyMeasurement = useCallback((): number => {
    if (touchStartTimeRef.current > 0) {
      const latency = performance.now() - touchStartTimeRef.current;
      touchStartTimeRef.current = 0;
      return latency;
    }
    return 0;
  }, []);

  /**
   * 현재 성능 메트릭 수집
   */
  const collectMetrics = useCallback((): PerformanceMetrics => {
    const renderStart = performance.now();

    // 더미 렌더링 작업으로 렌더 시간 측정
    const dummyDiv = document.createElement('div');
    dummyDiv.style.position = 'absolute';
    dummyDiv.style.left = '-9999px';
    dummyDiv.textContent = 'Performance test';
    document.body.appendChild(dummyDiv);
    document.body.removeChild(dummyDiv);

    const renderTime = performance.now() - renderStart;

    return {
      fps: fpsRef.current,
      memoryUsage: getMemoryUsage(),
      renderTime,
      touchLatency: 0, // 실제 터치 이벤트에서 측정
    };
  }, [getMemoryUsage]);

  /**
   * 성능 데이터 기록
   */
  const recordPerformanceData = useCallback((metrics: PerformanceMetrics) => {
    performanceDataRef.current.push(metrics);

    // 최근 100개 항목만 유지
    if (performanceDataRef.current.length > 100) {
      performanceDataRef.current = performanceDataRef.current.slice(-100);
    }
  }, []);

  /**
   * 성능 문제 감지 및 경고
   */
  const checkPerformanceIssues = useCallback((metrics: PerformanceMetrics) => {
    const warnings: string[] = [];

    // FPS가 30 이하인 경우
    if (metrics.fps < 30) {
      warnings.push(`낮은 FPS 감지: ${metrics.fps}fps`);
    }

    // 메모리 사용량이 100MB 이상인 경우
    if (metrics.memoryUsage > 100) {
      warnings.push(`높은 메모리 사용량: ${metrics.memoryUsage.toFixed(1)}MB`);
    }

    // 렌더 시간이 16ms(60fps 기준) 이상인 경우
    if (metrics.renderTime > 16) {
      warnings.push(`긴 렌더 시간: ${metrics.renderTime.toFixed(1)}ms`);
    }

    // 터치 레이턴시가 100ms 이상인 경우
    if (metrics.touchLatency > 100) {
      warnings.push(`높은 터치 레이턴시: ${metrics.touchLatency.toFixed(1)}ms`);
    }

    if (warnings.length > 0) {
      console.warn('Performance issues detected:', warnings);

      // 태블릿 환경에서 성능 최적화 제안
      if (metrics.memoryUsage > 80) {
        console.log('Consider: Reduce drawing history or clear old data');
      }

      if (metrics.fps < 20) {
        console.log('Consider: Lower drawing quality or reduce brush size');
      }
    }

    return warnings;
  }, []);

  /**
   * 성능 통계 계산
   */
  const getPerformanceStats = useCallback(() => {
    const data = performanceDataRef.current;
    if (data.length === 0) return null;

    const avgFPS = data.reduce((sum, d) => sum + d.fps, 0) / data.length;
    const avgMemory =
      data.reduce((sum, d) => sum + d.memoryUsage, 0) / data.length;
    const avgRenderTime =
      data.reduce((sum, d) => sum + d.renderTime, 0) / data.length;
    const avgTouchLatency =
      data.reduce((sum, d) => sum + d.touchLatency, 0) / data.length;

    return {
      average: {
        fps: Math.round(avgFPS),
        memoryUsage: Math.round(avgMemory * 10) / 10,
        renderTime: Math.round(avgRenderTime * 10) / 10,
        touchLatency: Math.round(avgTouchLatency * 10) / 10,
      },
      current: data[data.length - 1],
      samples: data.length,
    };
  }, []);

  /**
   * 성능 최적화 제안
   */
  const getOptimizationSuggestions = useCallback(() => {
    const stats = getPerformanceStats();
    if (!stats) return [];

    const suggestions: string[] = [];

    if (stats.average.fps < 40) {
      suggestions.push('브러시 크기를 줄이거나 그리기 정밀도를 낮춰보세요');
      suggestions.push('불필요한 브라우저 탭을 닫아보세요');
    }

    if (stats.average.memoryUsage > 80) {
      suggestions.push('그리기 기록을 일부 삭제해보세요');
      suggestions.push('페이지를 새로고침하여 메모리를 정리해보세요');
    }

    if (stats.average.touchLatency > 80) {
      suggestions.push('터치 거부 기능을 비활성화해보세요');
      suggestions.push('다른 앱들을 종료하여 시스템 부하를 줄여보세요');
    }

    return suggestions;
  }, [getPerformanceStats]);

  /**
   * 주기적 성능 모니터링
   */
  useEffect(() => {
    measureFPS();

    const monitoringInterval = setInterval(() => {
      const metrics = collectMetrics();
      recordPerformanceData(metrics);
      checkPerformanceIssues(metrics);
    }, 5000); // 5초마다 모니터링

    return () => {
      clearInterval(monitoringInterval);
    };
  }, [
    measureFPS,
    collectMetrics,
    recordPerformanceData,
    checkPerformanceIssues,
  ]);

  return {
    startTouchLatencyMeasurement,
    endTouchLatencyMeasurement,
    collectMetrics,
    getPerformanceStats,
    getOptimizationSuggestions,
    checkPerformanceIssues,
  };
};
