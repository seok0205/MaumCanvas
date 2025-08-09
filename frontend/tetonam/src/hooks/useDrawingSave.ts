import type Konva from 'konva';
import { useCallback } from 'react';
import { toast } from 'sonner';

import { CANVAS_CONFIG, DRAWING_STEPS } from '@/constants/drawing';
import { useCompressedLines } from '@/hooks/useCompressedLines';
import { useDrawingLocalStorage } from '@/hooks/useDrawingLocalStorage';
import { useAuthStore } from '@/stores/useAuthStore';
import { useDrawingStore } from '@/stores/useDrawingStore';
import { useUIStore } from '@/stores/useUIStore';
import { AuthenticationError } from '@/types/auth';
import type { DrawingCategory } from '@/types/drawing';

export const useDrawingSave = (
  stageRef: React.RefObject<Konva.Stage | null>,
  reActivateButtonRef: React.RefObject<HTMLButtonElement | null>
) => {
  const { user } = useAuthStore();
  const { currentStep, stepsLines, updateSavedImage } = useDrawingStore();

  const { deactivateEditing, triggerSaveAnimation } = useUIStore();

  const { saveDrawing } = useDrawingLocalStorage(user?.id || '');
  const { compress } = useCompressedLines();

  // 임시저장 (localStorage 사용)
  const handleSave = useCallback(async () => {
    if (!stageRef.current || !user?.id) {
      toast.error('저장할 수 없습니다.');
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

      toast.success(`${currentStepData.title} 임시저장 완료!`);

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
        toast.error(error.message);
      } else {
        toast.error('임시저장 중 오류가 발생했습니다.');
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
