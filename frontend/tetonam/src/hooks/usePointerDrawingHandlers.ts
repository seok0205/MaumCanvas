import type Konva from 'konva';
import { useCallback } from 'react';

import { DRAWING_STEPS } from '@/constants/drawing';
import { useDrawingStore } from '@/stores/useDrawingStore';
import { useUIStore } from '@/stores/useUIStore';
import type { DrawingLine } from '@/types/drawing';

/**
 * 포인터 그리기 핸들러 (멀티터치 방지 포함)
 * 단순화된 버전으로 기본적인 그리기 기능과 멀티터치 방지만 제공
 */
export const usePointerDrawingHandlers = () => {
  const {
    currentStep,
    isDrawing,
    setIsDrawing,
    addLineToCurrentStep,
    updateLastLinePoints,
    saveToHistory,
  } = useDrawingStore();

  const {
    isEditingActive,
    isEraser,
    brushSize,
    brushColor,
  } = useUIStore();

  // 멀티터치 감지 및 방지 로직 (Konva.js 최적화)
  const shouldRejectMultiTouch = useCallback((evt: PointerEvent): boolean => {
    // TouchEvent의 경우 touches 배열 확인
    if ('touches' in evt && evt.touches && Array.isArray(evt.touches)) {
      return evt.touches.length > 1;
    }
    return false;
  }, []);

  // 포인터 거부 로직 (멀티터치만 체크)
  const shouldRejectPointer = useCallback(
    (evt?: PointerEvent): boolean => {
      // 멀티터치 감지 시 거부
      if (evt && shouldRejectMultiTouch(evt)) {
        console.log('Multi-touch detected, rejecting pointer');
        return true;
      }
      return false;
    },
    [shouldRejectMultiTouch]
  );

  // 포인터 다운 핸들러
  const handlePointerDown = useCallback(
    (e: Konva.KonvaEventObject<PointerEvent>) => {
      if (!isEditingActive) return;
      if (currentStep < 0 || currentStep >= DRAWING_STEPS.length) return;

      // 멀티터치 거부
      if (shouldRejectPointer(e.evt)) {
        return;
      }

      const pos = e.target.getStage()?.getPointerPosition();
      if (!pos) return;

      setIsDrawing(true);

      const newLine: DrawingLine = {
        id: Date.now() + Math.random(),
        points: [pos.x, pos.y],
        stroke: isEraser ? '#FFFFFF' : brushColor,
        strokeWidth: brushSize,
        globalCompositeOperation: isEraser ? 'destination-out' : 'source-over',
      };

      addLineToCurrentStep(newLine);
    },
    [
      isEditingActive,
      currentStep,
      isEraser,
      brushSize,
      brushColor,
      setIsDrawing,
      addLineToCurrentStep,
      shouldRejectPointer,
    ]
  );

  // 포인터 무브 핸들러
  const handlePointerMove = useCallback(
    (e: Konva.KonvaEventObject<PointerEvent>) => {
      if (!isDrawing || !isEditingActive) return;
      if (currentStep < 0 || currentStep >= DRAWING_STEPS.length) return;

      // 멀티터치 거부
      if (shouldRejectPointer(e.evt)) {
        return;
      }

      const stage = e.target.getStage();
      const point = stage?.getPointerPosition();
      if (!point) return;

      updateLastLinePoints([point.x, point.y]);
    },
    [
      isDrawing,
      isEditingActive,
      currentStep,
      updateLastLinePoints,
      shouldRejectPointer,
    ]
  );

  // 포인터 업 핸들러
  const handlePointerUp = useCallback(() => {
    if (!isDrawing) return;

    setIsDrawing(false);
    saveToHistory();
  }, [isDrawing, setIsDrawing, saveToHistory]);

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
};
