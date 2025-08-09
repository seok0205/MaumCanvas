import { useCallback, useState } from 'react';

import { CANVAS_CONFIG, COLOR_PALETTE } from '@/constants/drawing';
import type { DrawingLine } from '@/types/drawing';

interface UseDrawingCanvasProps {
  currentStep: number;
  stepsLines: Array<Array<DrawingLine>>;
  setStepsLines: React.Dispatch<
    React.SetStateAction<Array<Array<DrawingLine>>>
  >;
  redoStacks: Array<Array<DrawingLine>>;
  setRedoStacks: React.Dispatch<
    React.SetStateAction<Array<Array<DrawingLine>>>
  >;
  history: Array<Array<DrawingLine>>;
  setHistory: React.Dispatch<React.SetStateAction<Array<Array<DrawingLine>>>>;
  isEditingActive: boolean;
}

interface UseDrawingCanvasReturn {
  // 그리기 상태
  isDrawing: boolean;
  brushSize: number;
  brushColor: string;
  isEraser: boolean;

  // 그리기 상태 변경 함수들
  setBrushSize: (size: number) => void;
  setBrushColor: (color: string) => void;
  setIsEraser: (isEraser: boolean) => void;

  // 이벤트 핸들러들
  handleMouseDown: (e: any) => void;
  handleMouseMove: (e: any) => void;
  handleMouseUp: () => void;

  // 액션 함수들
  handleUndo: () => void;
  handleRedo: () => void;
  handleClear: () => void;

  // 현재 단계의 선들
  currentLines: DrawingLine[];
}

export const useDrawingCanvas = ({
  currentStep,
  stepsLines,
  setStepsLines,
  redoStacks,
  setRedoStacks,
  history,
  setHistory,
  isEditingActive,
}: UseDrawingCanvasProps): UseDrawingCanvasReturn => {
  // 그리기 상태
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState<number>(
    CANVAS_CONFIG.DEFAULT_BRUSH_SIZE
  );
  const [brushColor, setBrushColor] = useState<string>(COLOR_PALETTE[0]);
  const [isEraser, setIsEraser] = useState(false);

  // 현재 단계의 선들
  const currentLines = stepsLines[currentStep] || [];

  // 그리기 시작
  const handleMouseDown = useCallback(
    (e: any) => {
      if (!isEditingActive) return; // 편집 비활성화 상태에서는 그리기 불가
      if (currentStep < 0 || currentStep >= 4) return;

      setIsDrawing(true);
      const pos = e.target.getStage().getPointerPosition();
      if (!pos) return;

      const newLine: DrawingLine = {
        id: Date.now(),
        points: [pos.x, pos.y],
        stroke: isEraser ? 'rgba(0,0,0,1)' : brushColor,
        strokeWidth: brushSize,
        globalCompositeOperation: isEraser ? 'destination-out' : 'source-over',
      };

      const newStepsLines = [...stepsLines];
      newStepsLines[currentStep] = [...currentLines, newLine];
      setStepsLines(newStepsLines);

      // 새 선이 시작되면 redo 스택은 초기화 (현재 단계)
      const newRedo = [...redoStacks];
      newRedo[currentStep] = [];
      setRedoStacks(newRedo);
    },
    [
      currentStep,
      stepsLines,
      currentLines,
      brushColor,
      brushSize,
      isEraser,
      isEditingActive,
      redoStacks,
      setStepsLines,
      setRedoStacks,
    ]
  );

  // 그리기 중
  const handleMouseMove = useCallback(
    (e: any) => {
      if (!isDrawing || !isEditingActive || currentStep < 0 || currentStep >= 4)
        return;

      const stage = e.target.getStage();
      const point = stage.getPointerPosition();
      const newStepsLines = [...stepsLines];
      const currentStepLines = newStepsLines[currentStep];

      if (!currentStepLines || currentStepLines.length === 0) return;

      const lastLine = currentStepLines[currentStepLines.length - 1];

      if (lastLine) {
        lastLine.points = lastLine.points.concat([point.x, point.y]);
        setStepsLines(newStepsLines);
      }
    },
    [isDrawing, currentStep, stepsLines, isEditingActive, setStepsLines]
  );

  // 그리기 종료
  const handleMouseUp = useCallback(() => {
    if (!isEditingActive) return;
    setIsDrawing(false);

    // 히스토리에 현재 상태 저장 (실행취소용) - 전체 스냅샷
    const newHistory = [...history];
    const currentStepLines = stepsLines[currentStep];
    if (currentStepLines) {
      newHistory[currentStep] = [...currentStepLines];
      setHistory(newHistory);
    }
  }, [history, currentStep, stepsLines, isEditingActive, setHistory]);

  // 실행취소
  const handleUndo = useCallback(() => {
    if (currentLines.length === 0) return;
    const newStepsLines = [...stepsLines];
    const currentStepArr = newStepsLines[currentStep] || [];
    const removed = currentStepArr[currentStepArr.length - 1];
    newStepsLines[currentStep] = currentLines.slice(0, -1);
    setStepsLines(newStepsLines);

    if (removed) {
      const newRedo = [...redoStacks];
      const currRedo = newRedo[currentStep] || [];
      newRedo[currentStep] = [...currRedo, removed];
      setRedoStacks(newRedo);
    }
  }, [
    currentLines,
    stepsLines,
    currentStep,
    redoStacks,
    setStepsLines,
    setRedoStacks,
  ]);

  // 되돌리기
  const handleRedo = useCallback(() => {
    const redoStack = redoStacks[currentStep];
    if (!redoStack || redoStack.length === 0) return;

    const newRedo = [...redoStacks];
    const currentRedoArr = newRedo[currentStep] || [];
    const restored = currentRedoArr[currentRedoArr.length - 1];
    if (!restored) return;

    newRedo[currentStep] = currentRedoArr.slice(0, -1);
    setRedoStacks(newRedo);

    const newStepsLines = [...stepsLines];
    const currLines = newStepsLines[currentStep] || [];
    newStepsLines[currentStep] = [...currLines, restored];
    setStepsLines(newStepsLines);
  }, [redoStacks, currentStep, stepsLines, setRedoStacks, setStepsLines]);

  // 현재 캔버스 지우기
  const handleClear = useCallback(() => {
    const newStepsLines = [...stepsLines];
    newStepsLines[currentStep] = [];
    setStepsLines(newStepsLines);

    const newHistory = [...history];
    newHistory[currentStep] = [];
    setHistory(newHistory);

    const newRedo = [...redoStacks];
    newRedo[currentStep] = [];
    setRedoStacks(newRedo);
  }, [
    stepsLines,
    currentStep,
    history,
    redoStacks,
    setStepsLines,
    setHistory,
    setRedoStacks,
  ]);

  return {
    // 상태
    isDrawing,
    brushSize,
    brushColor,
    isEraser,
    currentLines,

    // 상태 변경 함수들
    setBrushSize,
    setBrushColor,
    setIsEraser,

    // 이벤트 핸들러들
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,

    // 액션 함수들
    handleUndo,
    handleRedo,
    handleClear,
  };
};
