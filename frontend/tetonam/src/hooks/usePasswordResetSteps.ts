import {
  STEP_DESCRIPTIONS,
  STEP_PROGRESS_STYLES,
  STEP_TITLES,
} from '@/constants/passwordReset';
import type { PasswordResetStep } from '@/types/passwordReset';

interface UsePasswordResetStepsProps {
  currentStep: PasswordResetStep;
}

export const usePasswordResetSteps = ({
  currentStep,
}: UsePasswordResetStepsProps) => {
  // 단순한 객체 접근이므로 useMemo 불필요
  const stepTitle = STEP_TITLES[currentStep] || '비밀번호 재설정';
  const stepDescription = STEP_DESCRIPTIONS[currentStep] || '';

  // 단순한 계산이므로 useCallback 불필요
  const getStepProgress = (step: number) => {
    if (step === currentStep) {
      return STEP_PROGRESS_STYLES.CURRENT;
    }
    if (step < currentStep) {
      return STEP_PROGRESS_STYLES.COMPLETED;
    }
    return STEP_PROGRESS_STYLES.PENDING;
  };

  // 단순한 비교이므로 useCallback 불필요
  const isStepComplete = (step: number) => {
    return step < currentStep;
  };

  return {
    stepTitle,
    stepDescription,
    getStepProgress,
    isStepComplete,
  };
};
