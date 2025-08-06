import type { CounselingTypeCategory } from '@/types/counselingType';
import { cn } from '@/utils/cn';

interface CounselingTypeCardProps {
  category: CounselingTypeCategory;
  isSelected: boolean;
  onSelect: (category: CounselingTypeCategory) => void;
  className?: string;
}

export const CounselingTypeCard = ({
  category,
  isSelected,
  onSelect,
  className,
}: CounselingTypeCardProps) => {
  const handleClick = () => {
    onSelect(category);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(category);
    }
  };

  return (
    <button
      type='button'
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'w-full p-5 text-left rounded-lg border-2 transition-all duration-200',
        'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'group relative overflow-hidden',
        {
          'border-blue-500 bg-blue-50 shadow-md': isSelected,
          'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50':
            !isSelected,
        },
        className
      )}
      aria-pressed={isSelected}
      aria-label={`상담유형: ${category.title}. ${category.description}`}
    >
      <div className='flex flex-col items-start pr-8'>
        <h3 className='font-semibold text-base text-gray-900 leading-tight mb-2'>
          {category.title}
        </h3>
        <p className='text-sm text-gray-700 leading-relaxed'>
          {category.description}
        </p>
      </div>

      {/* 선택 표시 아이콘 - 절대 위치로 오른쪽 상단에 배치 */}
      <div
        className={cn(
          'absolute top-4 right-4 flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all duration-200',
          {
            'border-blue-500 bg-blue-500': isSelected,
            'border-gray-300 group-hover:border-gray-400': !isSelected,
          }
        )}
      >
        {isSelected && (
          <svg
            className='w-3 h-3 text-white'
            fill='currentColor'
            viewBox='0 0 20 20'
            aria-hidden='true'
          >
            <path
              fillRule='evenodd'
              d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
              clipRule='evenodd'
            />
          </svg>
        )}
      </div>

      {/* 호버 효과 */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/5 opacity-0',
          'group-hover:opacity-100 transition-opacity duration-200',
          { 'opacity-100': isSelected }
        )}
      />
    </button>
  );
};
