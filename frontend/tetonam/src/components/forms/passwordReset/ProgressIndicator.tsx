import type { PasswordResetStep } from '@/types/passwordReset';

interface ProgressIndicatorProps {
  currentStep: PasswordResetStep;
  getStepProgress: (step: number) => { width: string; bgColor: string };
}

export const ProgressIndicator = ({
  currentStep,
  getStepProgress,
}: ProgressIndicatorProps) => {
  return (
    <div className='flex justify-center space-x-2 mb-8'>
      {[1, 2, 3].map(step => {
        const { width, bgColor } = getStepProgress(step);
        return (
          <div
            key={step}
            className={`h-2 rounded-full transition-all duration-300 ${width} ${bgColor}`}
            aria-label={`단계 ${step}${step === currentStep ? ' (현재)' : ''}`}
          />
        );
      })}
    </div>
  );
};
