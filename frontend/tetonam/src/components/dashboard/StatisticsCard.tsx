import { Button } from '@/components/ui/interactive/button';
import { Card } from '@/components/ui/layout/card';
import type { DashboardStats } from '@/types/dashboard';
import { BarChart3 } from 'lucide-react';

interface StatisticsCardProps {
  stats: DashboardStats;
}

export const StatisticsCard = ({ stats }: StatisticsCardProps) => {
  const handleViewDetails = () => {
    // TODO: 상세 통계 페이지로 이동
    console.log('View detailed statistics');
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
          <BarChart3 className='w-5 h-5 text-primary mr-2' />
          자기 진단 결과
        </h3>
      </div>
      <div className='space-y-4'>
        <div className='text-center'>
          <div className='grid grid-cols-3 gap-4 mb-4'>
            <div>
              <div className='text-2xl font-bold text-primary'>
                {stats.totalCounselings}
              </div>
              <div className='text-sm text-muted-foreground'>총 상담자 수</div>
            </div>
            <div>
              <div className='text-2xl font-bold text-secondary'>
                {stats.weeklyCounselings}
              </div>
              <div className='text-sm text-muted-foreground'>이번 주 상담</div>
            </div>
            <div>
              <div className='text-2xl font-bold text-accent'>
                {stats.satisfactionRate}
              </div>
              <div className='text-sm text-muted-foreground'>만족도 평균</div>
            </div>
          </div>
          <Button
            className='w-full'
            onClick={handleViewDetails}
            aria-label='상세 통계 보기'
          >
            상세 통계 보기
          </Button>
        </div>
      </div>
    </Card>
  );
};
