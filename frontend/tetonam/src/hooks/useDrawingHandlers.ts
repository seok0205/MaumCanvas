import type Konva from 'konva';
import { useCallback } from 'react';

import { DRAWING_STEPS } from '@/constants/drawing';
import { useDrawingStore } from '@/stores/useDrawingStore';
import { useUIStore } from '@/stores/useUIStore';
import type { DrawingLine } from '@/types/drawing';

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

  // 그리기 시작
  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (!isEditingActive) return; // 편집 비활성화 상태에서는 그리기 불가
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

  // 그리기 중
  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      if (
        !isDrawing ||
        !isEditingActive ||
        currentStep < 0 ||
        currentStep >= DRAWING_STEPS.length
      )
        return;

      const stage = e.target.getStage();
      const point = stage?.getPointerPosition();
      if (!point) return;

      // 마지막 선의 포인트 배열에 새 포인트 추가
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

  // 그리기 종료
  const handleMouseUp = useCallback(() => {
    if (!isEditingActive) return;
    setIsDrawing(false);

    // 히스토리에 현재 상태 저장 (실행취소용)
    saveToHistory();
  }, [isEditingActive, setIsDrawing, saveToHistory]);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
};
