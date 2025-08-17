import { DiagnosisCard } from '@/components/ui/data-display/DiagnosisCard';
import { DiagnosisGridProps } from '@/types/diagnosis';

export const DiagnosisGrid = ({
  categories,
  onStartDiagnosis,
}: DiagnosisGridProps) => {
  return (
    <div
  className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr'
      role='grid'
      aria-label='진단 카테고리 목록'
    >
      {categories.map(category => (
        <div key={category.id} role='gridcell'>
          <DiagnosisCard
            category={category}
            onStartDiagnosis={onStartDiagnosis}
          />
        </div>
      ))}
    </div>
  );
};
