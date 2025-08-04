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

  return (
    <div
      className={cn(
        'flex flex-col p-6 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200',
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

      <p className='text-sm text-gray-600 mb-6 flex-1 leading-relaxed'>
        {category.description}
      </p>

      <Button
        onClick={handleStartDiagnosis}
        onKeyDown={handleKeyDown}
        className='w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2'
        aria-label={`${category.title} 진단 시작하기`}
        tabIndex={0}
      >
        <Play className='h-4 w-4' aria-hidden='true' />
        <span>진단 시작하기</span>
      </Button>
    </div>
  );
};
