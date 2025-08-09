import { Button } from '@/components/ui/interactive/button';
import { DiagnosisCardProps } from '@/types/diagnosis';
import { cn } from '@/utils/cn';
import { Play } from 'lucide-react';

export const DiagnosisCard = ({
  category,
  onStartDiagnosis,
}: DiagnosisCardProps) => {
  const handleStartDiagnosis = () => {
    onStartDiagnosis(category.id);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleStartDiagnosis();
    }
  };

  // 카드 색상에 따른 버튼 색상 매핑
  const getButtonColor = () => {
    if (category.color.includes('purple')) {
      return 'bg-purple-500 hover:bg-purple-600 focus:ring-purple-500';
    }
    if (category.color.includes('red')) {
      return 'bg-red-500 hover:bg-red-600 focus:ring-red-500';
    }
    if (category.color.includes('blue')) {
      return 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500';
    }
    if (category.color.includes('green')) {
      return 'bg-green-500 hover:bg-green-600 focus:ring-green-500';
    }
    if (category.color.includes('orange')) {
      return 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-500';
    }
    return 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500';
  };

  return (
    <div
      className={cn(
        'flex flex-col p-6 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 min-h-[12rem] h-full',
        category.color
      )}
      role='article'
      aria-labelledby={`diagnosis-title-${category.id}`}
    >
      <div className='flex items-center space-x-3 mb-4'>
        <div className='flex items-center justify-center' aria-hidden='true'>
          {category.icon}
        </div>
        <h3
          id={`diagnosis-title-${category.id}`}
          className='text-lg font-semibold text-gray-900'
        >
          {category.title}
        </h3>
      </div>

      <p className='text-sm text-gray-600 mb-6 flex-1 leading-relaxed line-clamp-3'>
        {category.description}
      </p>

      <Button
        onClick={handleStartDiagnosis}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-full text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2',
          getButtonColor()
        )}
        aria-label={`${category.title} 진단 시작하기`}
        tabIndex={0}
      >
        <Play className='h-4 w-4' aria-hidden='true' />
        <span>진단 시작하기</span>
      </Button>
    </div>
  );
};
