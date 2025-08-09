import { DRAWING_STEPS } from '@/constants/drawing';
import type { DrawingCategory } from '@/types/drawing';
import { CheckCircle, XCircle } from 'lucide-react';

interface DrawingStepHeaderProps {
  currentStep: number;
  currentStepData: {
    title: string;
    description: string;
  };
  saveStates: Record<DrawingCategory, any>;
}

const DrawingStepHeader = ({
  currentStep,
  currentStepData,
  saveStates,
}: DrawingStepHeaderProps) => {
  return (
    <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>
          {currentStepData.title}
        </h1>
        <p className='text-gray-600 mt-1'>{currentStepData.description}</p>
      </div>
      <div className='text-right'>
        <div className='text-sm text-gray-500 mb-1'>
          {currentStep + 1} / {DRAWING_STEPS.length}
        </div>
        <div className='w-40 h-2 bg-gray-200 rounded-full'>
          <div
            className='h-2 bg-yellow-500 rounded-full transition-all duration-300'
            style={{
              width: `${((currentStep + 1) / DRAWING_STEPS.length) * 100}%`,
            }}
          />
        </div>
        <div className='mt-3 grid grid-cols-2 gap-1'>
          {DRAWING_STEPS.map((step, index) => {
            const stepSaveState = saveStates[step.id as DrawingCategory];
            const isCurrent = index === currentStep;
            return (
              <div
                key={step.id}
                className='flex items-center gap-1 text-[11px]'
              >
                <span
                  className={`${isCurrent ? 'font-semibold text-yellow-600' : 'text-gray-500'} truncate`}
                >
                  {step.title}
                </span>
                {stepSaveState?.status === 'saved' ? (
                  <CheckCircle className='w-3 h-3 text-green-500' />
                ) : stepSaveState?.status === 'saving' ? (
                  <div className='w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin' />
                ) : (
                  <XCircle className='w-3 h-3 text-gray-400' />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export { DrawingStepHeader };
