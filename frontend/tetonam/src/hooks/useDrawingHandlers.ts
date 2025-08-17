import type Konva from 'konva';
import { useCallback } from 'react';

import { DRAWING_STEPS } from '@/constants/drawing';
import { useDrawingStore } from '@/stores/useDrawingStore';
import { useUIStore } from '@/stores/useUIStore';
import type { DrawingLine } from '@/types/drawing';

/**
 * 기존 마우스/터치 그리기 핸들러 (단순화)
 * 안정적이고 검증된 기본 그리기 기능 제공
 */
export const useDrawingHandlers = () => {
  const {
    currentStep,
    isDrawing,
    setIsDrawing,
    addLineToCurrentStep,
    updateLastLinePoints,
    saveToHistory,
  } = useDrawingStore();

  const { isEditingActive, isEraser, brushSize, brushColor } = useUIStore();

  // 그리기 시작 (마우스/터치 전용)
  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (!isEditingActive) return;
      if (currentStep < 0 || currentStep >= DRAWING_STEPS.length) return;

      setIsDrawing(true);
      const pos = e.target.getStage()?.getPointerPosition();
      if (!pos) return;

      const newLine: DrawingLine = {
        id: Date.now(),
        points: [pos.x, pos.y],
        stroke: isEraser ? 'rgba(0,0,0,1)' : brushColor,
        strokeWidth: brushSize,
        globalCompositeOperation: isEraser ? 'destination-out' : 'source-over',
        // 기본 포인터 타입 설정 (호환성)
        pointerType: 'mouse',
      };

      addLineToCurrentStep(newLine);
    },
    [
      currentStep,
      brushColor,
      brushSize,
      isEraser,
      isEditingActive,
      setIsDrawing,
      addLineToCurrentStep,
    ]
  );

  // 그리기 중 (마우스/터치 전용)
  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (!isDrawing || !isEditingActive) return;
      if (currentStep < 0 || currentStep >= DRAWING_STEPS.length) return;

      const stage = e.target.getStage();
      const point = stage?.getPointerPosition();
      if (!point) return;

      const { stepsLines } = useDrawingStore.getState();
      const currentStepLines = stepsLines[currentStep];
      if (!currentStepLines || currentStepLines.length === 0) return;

      const lastLine = currentStepLines[currentStepLines.length - 1];
      if (lastLine) {
        const newPoints = lastLine.points.concat([point.x, point.y]);
        updateLastLinePoints(newPoints);
      }
    },
    [isDrawing, isEditingActive, currentStep, updateLastLinePoints]
  );

  // 그리기 종료 (마우스/터치 전용)
  const handleMouseUp = useCallback(() => {
    if (!isEditingActive) return;
    setIsDrawing(false);
    saveToHistory();
  }, [isEditingActive, setIsDrawing, saveToHistory]);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};
