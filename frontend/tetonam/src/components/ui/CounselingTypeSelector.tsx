import { CounselingTypeCard } from '@/components/ui/CounselingTypeCard';
import type {
  COUNSELING_TYPE_DATA,
  CounselingTypeItem,
} from '@/types/counselingType';
import { cn } from '@/utils/cn';

interface CounselingTypeSelectorProps {
  selectedType: CounselingTypeItem | null;
  onTypeSelect: (type: CounselingTypeItem) => void;
  categories: typeof COUNSELING_TYPE_DATA;
  className?: string;
}

export const CounselingTypeSelector = ({
  selectedType,
  onTypeSelect,
  categories,
  className,
}: CounselingTypeSelectorProps) => {
  return (
    <div className={cn('space-y-6', className)}>
      <div className='text-center'>
        <h2 className='text-xl font-semibold text-gray-900 mb-2'>
          상담 유형 선택
        </h2>
        <p className='text-sm text-gray-600'>
          원하시는 상담 유형을 선택해주세요. 선택된 상담 유형의 세부 내용은
          아래에서 확인할 수 있습니다.
        </p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3'>
        {categories.map(category =>
          category.items.map(item => (
            <CounselingTypeCard
              key={item.id}
              item={item}
              categoryTitle={category.title}
              isSelected={selectedType?.id === item.id}
              onSelect={onTypeSelect}
            />
          ))
        )}
      </div>

      {selectedType && (
        <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
          <div className='flex items-start space-x-3'>
            <div className='flex-shrink-0'>
              <svg
                className='w-5 h-5 text-blue-500 mt-0.5'
                fill='currentColor'
                viewBox='0 0 20 20'
                aria-hidden='true'
              >
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <div>
              <h3 className='text-sm font-medium text-blue-900'>
                선택된 상담 유형: {selectedType.name}
              </h3>
              <p className='text-sm text-blue-700 mt-1'>
                {selectedType.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 접근성을 위한 스크린 리더 텍스트 */}
      <div className='sr-only' aria-live='polite' aria-atomic='true'>
        {selectedType
          ? `${selectedType.name} 상담 유형이 선택되었습니다.`
          : '상담 유형을 선택해주세요.'}
      </div>
    </div>
  );
};
