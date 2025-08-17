import { memo, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { ApiButton } from '@/components/ui/ApiButton';
import { Button } from '@/components/ui/interactive/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/overlay/tooltip';
import { DRAWING_STEPS } from '@/constants/drawing';
import { useDrawingStore } from '@/stores/useDrawingStore';
import { useUIStore } from '@/stores/useUIStore';
import type { StepSaveStates } from '@/types/drawing';
import { ArrowLeft, ArrowRight, Palette } from 'lucide-react';

interface DrawingControlsProps {
  saveStates: StepSaveStates;
  onPrevStep: () => void;
  onNextStep: () => void;
  onSubmit: () => void;
  isBlocked: boolean;
  canGoNext: (saveStates: StepSaveStates) => boolean;
}

/**
 * 네비게이션 버튼과 제출 버튼을 담당하는 컴포넌트
 * 단일 책임: 단계 이동과 제출 컨트롤만 처리
 */
const DrawingControls = memo<DrawingControlsProps>(
  ({ saveStates, onPrevStep, onNextStep, onSubmit, isBlocked, canGoNext }) => {
    // 스토어에서 필요한 상태들을 useShallow로 최적화하여 가져오기
    const { currentStep, stepsLines, isSubmitting } = useDrawingStore(
      useShallow(state => ({
        currentStep: state.currentStep,
        stepsLines: state.stepsLines,
        isSubmitting: state.isSubmitting,
      }))
    );

    const { isEditingActive } = useUIStore(
      useShallow(state => ({
        isEditingActive: state.isEditingActive,
      }))
    );

    // 메모이즈된 핸들러들
    const handlePrevStep = useCallback(() => {
      onPrevStep();
    }, [onPrevStep]);

    const handleNextStep = useCallback(() => {
      onNextStep();
    }, [onNextStep]);

    const handleSubmit = useCallback(() => {
      onSubmit();
    }, [onSubmit]);

    // 편집 중에는 네비게이션 숨김
    if (isEditingActive) {
      return null;
    }

    return (
      <div className='mt-2 md:mt-4 flex justify-between'>
        <Button
          variant='outline'
          onClick={handlePrevStep}
          disabled={currentStep === 0}
          className='flex items-center gap-2'
        >
          <ArrowLeft className='w-4 h-4' /> 이전 단계
        </Button>

        <div className='flex gap-3'>
          {currentStep === DRAWING_STEPS.length - 1 ? (
            <ApiButton
              onClick={handleSubmit}
              disabled={
                isBlocked ||
                stepsLines.some((lines: any[]) => lines.length === 0)
              }
              isLoading={isSubmitting}
              loadingText='제출 중...'
              className='flex items-center gap-2 bg-green-600 hover:bg-green-700'
            >
              <Palette className='w-4 h-4' /> 그림 제출하기
            </ApiButton>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      onClick={handleNextStep}
                      disabled={
                        currentStep === DRAWING_STEPS.length - 1 ||
                        !canGoNext(saveStates)
                      }
                      className='flex items-center gap-2'
                    >
                      다음 단계 <ArrowRight className='w-4 h-4' />
                    </Button>
                  </div>
                </TooltipTrigger>
                {!canGoNext(saveStates) && (
                  <TooltipContent side='top'>
                    <p>임시저장 후 진행해주세요.</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    );
  }
);

DrawingControls.displayName = 'DrawingControls';

export { DrawingControls };
