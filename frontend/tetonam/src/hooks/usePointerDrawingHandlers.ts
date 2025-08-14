import type Konva from 'konva';
import { useCallback } from 'react';

import { DRAWING_STEPS } from '@/constants/drawing';
import { useDrawingStore } from '@/stores/useDrawingStore';
import { useUIStore } from '@/stores/useUIStore';
import type { DrawingLine, PenEventData } from '@/types/drawing';

/**
 * 터치펜/포인터 전용 그리기 핸들러
 * 압력 감지, 터치 거부, 기울기 감지 등 고급 기능 제공
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
    penSettings,
    isPenActive,
    activePenPointerId,
    setIsPenActive,
    setActivePenPointerId,
    calculateDynamicStrokeWidth,
  } = useUIStore();

  // 포인터 이벤트 데이터 추출 (타입 안전)
  const extractPointerData = useCallback((evt: PointerEvent): PenEventData => {
    return {
      pressure: evt.pressure || 0.5,
      tiltX: evt.tiltX || 0,
      tiltY: evt.tiltY || 0,
      pointerType: evt.pointerType as 'mouse' | 'pen' | 'touch',
      pointerId: evt.pointerId,
    };
  }, []);

  // 스마트한 터치 거부 로직 (태블릿 최적화)
  const shouldRejectPointer = useCallback(
    (pointerData: PenEventData): boolean => {
      // 터치 거부가 비활성화된 경우 모든 입력 허용
      if (!penSettings.touchRejection) return false;

      // 펜이 활성화되어 있는 경우에만 터치 거부 로직 적용
      if (isPenActive && activePenPointerId !== null) {
        // 같은 펜 포인터는 항상 허용
        if (
          pointerData.pointerType === 'pen' &&
          pointerData.pointerId === activePenPointerId
        ) {
          return false;
        }

        // 다른 펜 포인터나 터치의 경우
        // 태블릿 환경에서는 더 관대한 정책 적용
        if (pointerData.pointerType === 'touch') {
          // 압력이 감지되지 않는 터치는 거부 (손바닥 터치 가능성)
          return pointerData.pressure === 0 || pointerData.pressure > 0.8;
        }

        // 다른 펜 포인터는 허용 (멀티터치 지원)
        return false;
      }

      // 펜이 비활성화된 상태에서는 모든 입력 허용
      return false;
    },
    [penSettings.touchRejection, isPenActive, activePenPointerId]
  );

  // 포인터 다운 핸들러 (태블릿 최적화)
  const handlePointerDown = useCallback(
    (e: Konva.KonvaEventObject<PointerEvent>) => {
      if (!isEditingActive) return;
      if (currentStep < 0 || currentStep >= DRAWING_STEPS.length) return;

      const pointerData = extractPointerData(e.evt);

      // 터치 거부 확인
      if (shouldRejectPointer(pointerData)) {
        console.log(
          'Pointer rejected:',
          pointerData.pointerType,
          pointerData.pointerId
        );
        return;
      }

      // 펜 상태 업데이트 (더 안전한 처리)
      if (pointerData.pointerType === 'pen') {
        setIsPenActive(true);
        setActivePenPointerId(pointerData.pointerId);
      } else if (pointerData.pointerType === 'touch' && !isPenActive) {
        // 펜이 비활성 상태일 때만 터치 허용
        setIsPenActive(false);
        setActivePenPointerId(null);
      }

      // 이벤트 기본 동작 방지 (스크롤, 줌 등)
      if (e.evt.preventDefault) {
        e.evt.preventDefault();
      }
      if (e.evt.stopPropagation) {
        e.evt.stopPropagation();
      }

      setIsDrawing(true);
      const pos = e.target.getStage()?.getPointerPosition();
      if (!pos) return;

      // 동적 strokeWidth 계산 (압력 고려)
      const dynamicStrokeWidth =
        penSettings.pressureSensitivity && pointerData.pointerType === 'pen'
          ? calculateDynamicStrokeWidth(brushSize, pointerData.pressure)
          : brushSize;

      const newLine: DrawingLine = {
        id: Date.now() + Math.random(), // 더 유니크한 ID
        points: [pos.x, pos.y],
        stroke: isEraser ? 'rgba(0,0,0,1)' : brushColor,
        strokeWidth: dynamicStrokeWidth,
        globalCompositeOperation: isEraser ? 'destination-out' : 'source-over',
        pointerType: pointerData.pointerType,
        ...(pointerData.pointerType === 'pen' && {
          pressureData: [pointerData.pressure],
          tiltData: [{ x: pointerData.tiltX, y: pointerData.tiltY }],
        }),
      };

      addLineToCurrentStep(newLine);
    },
    [
      isEditingActive,
      currentStep,
      brushSize,
      brushColor,
      isEraser,
      penSettings.pressureSensitivity,
      extractPointerData,
      shouldRejectPointer,
      setIsPenActive,
      setActivePenPointerId,
      setIsDrawing,
      addLineToCurrentStep,
      calculateDynamicStrokeWidth,
      isPenActive,
    ]
  );

  // 포인터 이동 핸들러
  const handlePointerMove = useCallback(
    (e: Konva.KonvaEventObject<PointerEvent>) => {
      if (!isDrawing || !isEditingActive) return;
      if (currentStep < 0 || currentStep >= DRAWING_STEPS.length) return;

      const pointerData = extractPointerData(e.evt);

      // 터치 거부 확인
      if (shouldRejectPointer(pointerData)) {
        return;
      }

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

        // 펜 데이터 추가 (성능을 위해 실제 펜일 때만)
        if (
          pointerData.pointerType === 'pen' &&
          lastLine.pointerType === 'pen'
        ) {
          // 압력과 기울기 데이터는 나중에 고급 기능으로 활용 가능
          // 현재는 기본 그리기 기능에 집중
        }
      }
    },
    [
      isDrawing,
      isEditingActive,
      currentStep,
      extractPointerData,
      shouldRejectPointer,
      updateLastLinePoints,
    ]
  );

  // 포인터 업 핸들러
  const handlePointerUp = useCallback(
    (e: Konva.KonvaEventObject<PointerEvent>) => {
      if (!isEditingActive) return;

      const pointerData = extractPointerData(e.evt);

      // 펜 상태 정리
      if (
        pointerData.pointerType === 'pen' &&
        pointerData.pointerId === activePenPointerId
      ) {
        setIsPenActive(false);
        setActivePenPointerId(null);
      }

      setIsDrawing(false);
      saveToHistory();
    },
    [
      isEditingActive,
      activePenPointerId,
      extractPointerData,
      setIsPenActive,
      setActivePenPointerId,
      setIsDrawing,
      saveToHistory,
    ]
  );

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
};
