import { useCallback } from 'react';

import { DRAWING_STEPS } from '@/constants/drawing';
import type { DrawingCategory, StepSaveStates } from '@/types/drawing';

interface UseDrawingNavigationProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  setIsEditingActive: (active: boolean) => void;
  closeAllPopovers: () => void;
  goToPrevStep: () => void;
  goToNextStep: () => void;
}

interface UseDrawingNavigationReturn {
  handlePrevStep: () => void;
  handleNextStep: () => void;
  handleThumbnailSelect: (index: number) => void;
  canGoNext: (saveStates: StepSaveStates) => boolean;
  canGoPrev: boolean;
}

/**
 * 그림 그리기 단계 네비게이션을 담당하는 커스텀 훅
 */
export const useDrawingNavigation = ({
  currentStep,
  setCurrentStep,
  setIsEditingActive,
  closeAllPopovers,
  goToPrevStep,
  goToNextStep,
}: UseDrawingNavigationProps): UseDrawingNavigationReturn => {
  // 이전 단계로 이동
  const handlePrevStep = useCallback(() => {
    goToPrevStep();
  }, [goToPrevStep]);

  // 다음 단계로 이동
  const handleNextStep = useCallback(() => {
    goToNextStep();
  }, [goToNextStep]);

  // 썸네일 클릭 시 해당 단계로 이동 + 편집 재활성화
  const handleThumbnailSelect = useCallback(
    (index: number) => {
      if (index < 0 || index >= DRAWING_STEPS.length) return;

      setCurrentStep(index);
      // 단계 전환 직후 편집 활성화
      setIsEditingActive(true);
      // 팝오버 초기화
      closeAllPopovers();
    },
    [setCurrentStep, setIsEditingActive, closeAllPopovers]
  );

  // 다음 단계로 갈 수 있는지 체크
  const canGoNext = useCallback(
    (saveStates: StepSaveStates) => {
      const currentStepData = DRAWING_STEPS[currentStep];
      if (!currentStepData) return false;

      const stepSaveState = saveStates[currentStepData.id as DrawingCategory];
      return stepSaveState?.status === 'saved';
    },
    [currentStep]
  );

  // 이전 단계로 갈 수 있는지 체크
  const canGoPrev = currentStep > 0;

  return {
    handlePrevStep,
    handleNextStep,
    handleThumbnailSelect,
    canGoNext,
    canGoPrev,
  };
};
