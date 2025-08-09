import React from 'react';

import { ApiButton } from '@/components/ui/ApiButton';
import { Button } from '@/components/ui/interactive/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/overlay/tooltip';
import { DRAWING_STEPS } from '@/constants/drawing';
import type { DrawingLine, StepSaveStates } from '@/types/drawing';
import { ArrowLeft, ArrowRight, Palette } from 'lucide-react';

interface DrawingControlsProps {
  currentStep: number;
  isEditingActive: boolean;
  isSubmitting: boolean;
  isBlocked: boolean;
  stepsLines: DrawingLine[][];
  saveStates: StepSaveStates;
  onPrevStep: () => void;
  onNextStep: () => void;
  onSubmit: () => void;
  canGoNext: (saveStates: StepSaveStates) => boolean;
}

/**
 * 네비게이션 버튼과 제출 버튼을 담당하는 컴포넌트
 * 단일 책임: 단계 이동과 제출 컨트롤만 처리
 */
const DrawingControls = React.memo<DrawingControlsProps>(
  ({
    currentStep,
    isEditingActive,
    isSubmitting,
    isBlocked,
    stepsLines,
    saveStates,
    onPrevStep,
    onNextStep,
    onSubmit,
    canGoNext,
  }) => {
    // 편집 중에는 네비게이션 숨김
    if (isEditingActive) {
      return null;
    }

    return (
      <div className='mt-2 md:mt-4 flex justify-between'>
        <Button
          variant='outline'
          onClick={onPrevStep}
          disabled={currentStep === 0}
          className='flex items-center gap-2'
        >
          <ArrowLeft className='w-4 h-4' /> 이전 단계
        </Button>

        <div className='flex gap-3'>
          {currentStep === DRAWING_STEPS.length - 1 ? (
            <ApiButton
              onClick={onSubmit}
              disabled={
                isBlocked || stepsLines.some(lines => lines.length === 0)
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
                      onClick={onNextStep}
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
