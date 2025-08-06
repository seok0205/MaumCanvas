import { Tooltip } from '@/components/ui/Tooltip';
import type { CounselingTypeItem } from '@/types/counselingType';
import { cn } from '@/utils/cn';

interface CounselingTypeCardProps {
  item: CounselingTypeItem;
  isSelected: boolean;
  onSelect: (item: CounselingTypeItem) => void;
  className?: string;
}

export const CounselingTypeCard = ({
  item,
  isSelected,
  onSelect,
  className,
}: CounselingTypeCardProps) => {
  const handleClick = () => {
    onSelect(item);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(item);
    }
  };

  return (
    <Tooltip content={item.description} position='top'>
      <button
        type='button'
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-full p-4 text-left rounded-lg border-2 transition-all duration-200',
          'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'group relative overflow-hidden',
          {
            'border-blue-500 bg-blue-50 text-blue-700 shadow-md': isSelected,
            'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50':
              !isSelected,
          },
          className
        )}
        aria-pressed={isSelected}
        aria-label={`상담유형: ${item.name}. ${item.description}`}
      >
        <div className='flex items-center justify-between'>
          <span className='font-medium text-sm leading-tight'>{item.name}</span>

          {/* 선택 표시 아이콘 */}
          <div
            className={cn(
              'flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all duration-200',
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
    </Tooltip>
  );
};
