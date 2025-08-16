import type Konva from 'konva';
import { useCallback } from 'react';

import { CANVAS_CONFIG, DRAWING_STEPS } from '@/constants/drawing';
import { TOAST_MESSAGES, TOAST_IDS } from '@/constants/toastMessages';
import { toastManager } from '@/utils/toastManager';
import { useCompressedLines } from '@/hooks/useCompressedLines';
import { useAuthStore } from '@/stores/useAuthStore';
import { useDrawingStore } from '@/stores/useDrawingStore';
import { useUIStore } from '@/stores/useUIStore';
import { AuthenticationError } from '@/types/auth';
import type { DrawingCategory } from '@/types/drawing';

// saveDrawing 함수를 외부(동일 훅 인스턴스)에서 주입하도록 변경하여
// 중복 useDrawingLocalStorage 인스턴스로 인한 saveStates 불일치 문제 해결
export const useDrawingSave = (
  stageRef: React.RefObject<Konva.Stage | null>,
  reActivateButtonRef: React.RefObject<HTMLButtonElement | null>,
  saveDrawing: (stepId: DrawingCategory, dataURL: string) => Promise<boolean>
) => {
  const { user } = useAuthStore();
  const { currentStep, stepsLines, updateSavedImage } = useDrawingStore();
  const { deactivateEditing, triggerSaveAnimation } = useUIStore();
  const { compress } = useCompressedLines();

  // 임시저장 (localStorage 사용)
  const handleSave = useCallback(async () => {
    if (!stageRef.current || !user?.id) {
      toastManager.preventDuplicate.error(
        TOAST_MESSAGES.TEMP_SAVE.ERROR,
        TOAST_IDS.DRAWING_SAVE
      );
      return;
    }

    const currentStepData = DRAWING_STEPS[currentStep];
    if (!currentStepData) return;

    try {
      const dataURL = stageRef.current.toDataURL({
        mimeType: 'image/png',
        quality: CANVAS_CONFIG.IMAGE_QUALITY,
        pixelRatio: CANVAS_CONFIG.PIXEL_RATIO,
      });

      const stepId = currentStepData.id as DrawingCategory;

      // localStorage에 저장
      await saveDrawing(stepId, dataURL);

      // 메모리 저장도 유지 (하위 호환성)
      updateSavedImage(stepId, dataURL);

      // 추가: 라인 데이터 압축 저장 (선 데이터 -> delta)
      try {
        const currentRawLines = stepsLines[currentStep] || [];
        if (currentRawLines.length > 0) {
          const compressed = compress(currentRawLines as any);
          const compressedKey = `DRAWING_COMPRESSED_${user.id}_${stepId}`;
          localStorage.setItem(compressedKey, compressed);
        }
      } catch (e) {
        console.warn('라인 압축 저장 실패:', e);
      }

      // 성공 토스트 - 단계별 메시지
      toastManager.preventDuplicate.success(
        TOAST_MESSAGES.TEMP_SAVE.SUCCESS(currentStepData.title),
        TOAST_IDS.DRAWING_SAVE
      );

      // 저장 후 편집 비활성화 / 헤더 복원
      deactivateEditing();
      triggerSaveAnimation();

      // 포커스 재설정
      requestAnimationFrame(() => {
        reActivateButtonRef.current?.focus({ preventScroll: true });
      });
    } catch (error) {
      console.error('Save error:', error);

      if (error instanceof AuthenticationError) {
        toastManager.preventDuplicate.error(
          error.message,
          TOAST_IDS.DRAWING_SAVE
        );
      } else {
        toastManager.preventDuplicate.error(
          TOAST_MESSAGES.TEMP_SAVE.ERROR,
          TOAST_IDS.DRAWING_SAVE
        );
      }
    }
  }, [
    currentStep,
    user?.id,
    saveDrawing,
    stepsLines,
    compress,
    updateSavedImage,
    deactivateEditing,
    triggerSaveAnimation,
    stageRef,
    reActivateButtonRef,
  ]);

  return {
    handleSave,
  };
};
