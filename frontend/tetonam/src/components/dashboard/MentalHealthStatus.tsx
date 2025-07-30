import { Card } from '@/components/ui/layout/card';
import type { MentalHealthMetric } from '@/types/dashboard';
import { TrendingUp } from 'lucide-react';

interface MentalHealthStatusProps {
  metrics: {
    stressLevel: MentalHealthMetric;
    depressionLevel: MentalHealthMetric;
    anxietyLevel: MentalHealthMetric;
  };
}

export const MentalHealthStatus = ({ metrics }: MentalHealthStatusProps) => {
  const renderProgressBar = (metric: MentalHealthMetric) => {
    return (
      <div key={metric.label}>
        <div className='flex justify-between text-sm mb-1'>
          <span className='text-muted-foreground'>
            {metric.label === '중간'
              ? '스트레스 지수'
              : metric.label === '낮음'
                ? '우울감 수준'
                : '불안감 수준'}
          </span>
          <span className='text-foreground font-medium'>{metric.label}</span>
        </div>
        <div className='w-full bg-muted rounded-full h-2'>
          <div
            className={`${metric.color} h-2 rounded-full w-[${metric.value}%]`}
            role='progressbar'
            aria-valuenow={metric.value}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${metric.label} 수준: ${metric.value}%`}
          />
        </div>
      </div>
    );
  };

  return (
    <Card
      className='
      p-6 shadow-card border border-border/50
      bg-card/80 backdrop-blur-sm
    '
    >
      <div className='flex items-center justify-between mb-4'>
        <h3
          className='
          text-lg font-semibold text-foreground
          flex items-center
        '
        >
          <TrendingUp className='w-5 h-5 text-primary mr-2' />
          자기 진단 결과
        </h3>
      </div>
      <div className='space-y-4'>
        {renderProgressBar(metrics.stressLevel)}
        {renderProgressBar(metrics.depressionLevel)}
        {renderProgressBar(metrics.anxietyLevel)}
      </div>
    </Card>
  );
};
