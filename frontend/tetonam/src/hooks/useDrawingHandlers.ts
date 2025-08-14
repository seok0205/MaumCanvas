import type Konva from 'konva';
import { useCallback, useRef } from 'react';

import { DRAWING_STEPS } from '@/constants/drawing';
import { useDrawingStore } from '@/stores/useDrawingStore';
import type { DrawingLine } from '@/types/drawing';
import {
  calculateTouchSensitivity,
  detectDeviceType,
  filterPoints,
  touchPerformanceMonitor,
} from '@/utils/touchOptimization';

// React 18 useEffectEvent 대체 패턴 활용
function useEffectEvent<T extends (...args: any[]) => any>(fn: T): T {
  const ref = useRef<T>(fn);
  ref.current = fn;
  return useCallback((...args: any[]) => ref.current(...args), []) as T;
}

export const useDrawingHandlers = () => {
  const { currentStep, addLineToCurrentStep, updateLastLinePoints, setIsDrawing } = useDrawingStore();

  const isDrawing = useRef(false);
  const rafId = useRef<number | null>(null);
  const lastEventTime = useRef(0);
  const deviceType = useRef(detectDeviceType());

  // useEffectEvent 패턴으로 성능 최적화된 점 처리 로직
  const processPointsOptimized = useEffectEvent((points: number[]) => {
    // filterPoints 함수를 실제로 활용하여 점 최적화
    const optimizedPoints = filterPoints(points, 2); // sensitivity 값을 숫자로 전달
    return optimizedPoints;
  });

  // useEffectEvent 패턴으로 터치 감도 계산 로직
  const calculateSensitivity = useEffectEvent(() => {
    return calculateTouchSensitivity(deviceType.current);
  });

  const handleMouseDown = useCallback((event: Konva.KonvaEventObject<PointerEvent>) => {
    // MDN Best Practice: isPrimary와 pointerType 검증
    const pointerEvent = event.evt;
    
    // 기본 터치만 처리 (멀티터치 방지)
    if (!pointerEvent.isPrimary) return;
    
    // 포인터 타입별 최적화
    const isTouch = pointerEvent.pointerType === 'touch';
    const isMouse = pointerEvent.pointerType === 'mouse';
    const isPen = pointerEvent.pointerType === 'pen';
    
    if (!isTouch && !isMouse && !isPen) return;

    // 그리기 단계에서만 활성화
    if (currentStep < 0 || currentStep >= DRAWING_STEPS.length) return;

    isDrawing.current = true;
    setIsDrawing(true);

    const stage = event.target.getStage();
    if (!stage) return;

    const position = stage.getPointerPosition();
    if (!position) return;

    touchPerformanceMonitor.recordEvent();

    // useEffectEvent 패턴으로 최적화된 감도 계산
    const sensitivity = calculateSensitivity();
    const adjustedPosition = {
      x: position.x * sensitivity,
      y: position.y * sensitivity,
    };

    const newLine: DrawingLine = {
      id: Date.now(),
      points: [adjustedPosition.x, adjustedPosition.y],
      stroke: '#000000',
      strokeWidth: 2,
      globalCompositeOperation: 'source-over',
    };

    addLineToCurrentStep(newLine);
  }, [currentStep, addLineToCurrentStep, setIsDrawing, calculateSensitivity]);

  const handleMouseMove = useCallback((event: Konva.KonvaEventObject<PointerEvent>) => {
    if (!isDrawing.current) return;

    // MDN Best Practice: isPrimary 검증
    const pointerEvent = event.evt;
    if (!pointerEvent.isPrimary) return;

    // requestAnimationFrame으로 성능 최적화
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }

    rafId.current = requestAnimationFrame(() => {
      const currentTime = performance.now();
      if (currentTime - lastEventTime.current < 16) return; // 60fps 제한

      const stage = event.target.getStage();
      if (!stage) return;

      const position = stage.getPointerPosition();
      if (!position) return;

      // useEffectEvent 패턴으로 최적화된 감도 계산
      const sensitivity = calculateSensitivity();
      const adjustedPosition = {
        x: position.x * sensitivity,
        y: position.y * sensitivity,
      };

      // 현재 라인의 점들 업데이트 (최적화 적용)
      const newPoints = [adjustedPosition.x, adjustedPosition.y];
      const optimizedPoints = processPointsOptimized(newPoints);
      
      updateLastLinePoints(optimizedPoints);

      touchPerformanceMonitor.recordEvent();
      lastEventTime.current = currentTime;
    });
  }, [updateLastLinePoints, calculateSensitivity, processPointsOptimized]);

  const handleMouseUp = useCallback((event: Konva.KonvaEventObject<PointerEvent>) => {
    // MDN Best Practice: isPrimary 검증
    const pointerEvent = event.evt;
    if (!pointerEvent.isPrimary) return;

    if (!isDrawing.current) return;

    isDrawing.current = false;
    setIsDrawing(false);

    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }

    touchPerformanceMonitor.reset();
  }, [setIsDrawing]);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};
