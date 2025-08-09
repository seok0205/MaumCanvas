import { DRAWING_STEPS } from '@/constants/drawing';

interface DrawingThumbnailsProps {
  savedImages: Record<string, string>;
  currentStep: number;
  handleThumbnailSelect: (idx: number) => void;
}

const DrawingThumbnails = ({
  savedImages,
  currentStep,
  handleThumbnailSelect,
}: DrawingThumbnailsProps) => {
  return (
    <div className='mt-4 flex flex-wrap gap-4'>
      {DRAWING_STEPS.map((step, idx) => {
        const img = savedImages[step.id];
        if (!img) return null;
        const isActive = idx === currentStep;
        return (
          <div
            key={step.id}
            role='button'
            tabIndex={0}
            aria-label={`${step.title} 단계로 이동`}
            onClick={() => handleThumbnailSelect(idx)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleThumbnailSelect(idx);
              }
            }}
            className={`flex flex-col items-center w-24 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded-md ${isActive ? 'opacity-100' : 'opacity-80 hover:opacity-100'} transition`}
          >
            <div
              className={`w-24 h-32 border rounded-md overflow-hidden bg-white shadow-sm flex items-center justify-center relative ${isActive ? 'border-yellow-500 ring-2 ring-yellow-300' : 'border-gray-300 group-hover:border-gray-400'}`}
            >
              <img
                src={img}
                alt={`${step.title} 임시저장 썸네일`}
                className='w-full h-full object-contain'
                loading='lazy'
              />
              <div className='absolute bottom-1 right-1 text-[10px] px-1.5 py-0.5 rounded bg-white/80 backdrop-blur border border-gray-200 text-gray-700'>
                {idx + 1}
              </div>
            </div>
            <span className='mt-1 text-[11px] text-gray-700 text-center line-clamp-2'>
              {step.title}
            </span>
            <span className='sr-only'>썸네일 클릭 시 해당 단계 편집 시작</span>
          </div>
        );
      })}
    </div>
  );
};

export { DrawingThumbnails };
