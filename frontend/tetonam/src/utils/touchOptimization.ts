/**
 * 태블릿 성능 모니터링 및 최적화 유틸리티
 */

interface TouchPerformanceMetrics {
  eventCount: number;
  averageInterval: number;
  lastEventTime: number;
  droppedEvents: number;
}

class TouchPerformanceMonitor {
  private metrics: TouchPerformanceMetrics = {
    eventCount: 0,
    averageInterval: 0,
    lastEventTime: 0,
    droppedEvents: 0,
  };

  private intervals: number[] = [];
  private readonly maxIntervals = 100; // 최근 100개 이벤트만 추적

  /**
   * 터치 이벤트 기록
   */
  recordEvent(): boolean {
    const now = performance.now();

    if (this.metrics.lastEventTime > 0) {
      const interval = now - this.metrics.lastEventTime;
      this.intervals.push(interval);

      // 배열 크기 제한
      if (this.intervals.length > this.maxIntervals) {
        this.intervals.shift();
      }

      // 평균 간격 계산
      this.metrics.averageInterval =
        this.intervals.reduce((sum, i) => sum + i, 0) / this.intervals.length;

      // 너무 빠른 이벤트는 드롭 (16ms 미만 = 60fps 초과)
      if (interval < 16) {
        this.metrics.droppedEvents++;
        return false; // 이벤트 드롭
      }
    }

    this.metrics.eventCount++;
    this.metrics.lastEventTime = now;
    return true; // 이벤트 처리
  }

  /**
   * 성능 메트릭 조회
   */
  getMetrics(): TouchPerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * 메트릭 리셋
   */
  reset(): void {
    this.metrics = {
      eventCount: 0,
      averageInterval: 0,
      lastEventTime: 0,
      droppedEvents: 0,
    };
    this.intervals = [];
  }

  /**
   * 성능 경고 체크
   */
  shouldWarn(): boolean {
    return (
      this.metrics.averageInterval > 0 &&
      this.metrics.averageInterval < 10 && // 100fps 초과
      this.metrics.droppedEvents > 10
    );
  }
}

// 싱글톤 인스턴스
export const touchPerformanceMonitor = new TouchPerformanceMonitor();

/**
 * 디바이스 타입 감지
 */
export const detectDeviceType = (): 'mouse' | 'touch' | 'pen' => {
  if (typeof window === 'undefined') return 'mouse';

  // 터치 지원 확인
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // 펜 지원 확인 (실험적)
  const hasPointerEvents = 'PointerEvent' in window;

  if (hasPointerEvents && hasTouch) {
    return 'pen'; // 포인터 이벤트와 터치가 모두 지원되면 펜으로 추정
  } else if (hasTouch) {
    return 'touch';
  } else {
    return 'mouse';
  }
};

/**
 * 터치 감도 조정
 */
export const calculateTouchSensitivity = (
  deviceType: 'mouse' | 'touch' | 'pen'
): number => {
  switch (deviceType) {
    case 'pen':
      return 1; // 펜은 정밀도가 높으므로 낮은 감도
    case 'touch':
      return 3; // 터치는 손가락이므로 높은 감도
    case 'mouse':
    default:
      return 2; // 마우스는 중간 감도
  }
};

/**
 * 포인트 간 거리 계산
 */
export const calculateDistance = (
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * 포인트 필터링 (중복 제거)
 */
export const filterPoints = (
  points: number[],
  sensitivity: number = 2
): number[] => {
  if (points.length < 4) return points; // 최소 2개 포인트 필요

  // 타입 안전성을 위한 체크
  if (points[0] === undefined || points[1] === undefined) return points;

  const filtered: number[] = [points[0], points[1]]; // 첫 번째 포인트 유지

  for (let i = 2; i < points.length - 1; i += 2) {
    const x = points[i];
    const y = points[i + 1];

    // 타입 안전성 체크
    if (x === undefined || y === undefined) continue;

    const currentPoint = { x, y };
    const lastX = filtered[filtered.length - 2];
    const lastY = filtered[filtered.length - 1];

    // 타입 안전성 체크
    if (lastX === undefined || lastY === undefined) continue;

    const lastPoint = { x: lastX, y: lastY };

    // 거리가 감도보다 크면 포인트 추가
    if (calculateDistance(currentPoint, lastPoint) >= sensitivity) {
      filtered.push(x, y);
    }
  }

  return filtered;
};
