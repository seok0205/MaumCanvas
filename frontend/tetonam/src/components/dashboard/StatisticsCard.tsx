import { Card } from '@/components/ui/layout/card';
import { useCounselorTotalCount, useCounselorWeeklyCount } from '@/hooks/useCounselorStatistics';
import { BarChart3, Users, Calendar } from 'lucide-react';

export const StatisticsCard = () => {
  // 🎯 각 통계별로 개별 구독 - 해당 값 변경시만 리렌더링
  const { 
    data: totalCounselors = 0, 
    isLoading: isTotalLoading 
  } = useCounselorTotalCount();
  
  const { 
    data: weeklyCounselings = 0, 
    isLoading: isWeeklyLoading 
  } = useCounselorWeeklyCount();
  
  const isLoading = isTotalLoading || isWeeklyLoading;

  return (
    <Card
      className='
      p-6 shadow-card border border-border/50
      bg-card backdrop-blur-sm
      transition-all duration-300
    '
    >
      <div className='flex items-center justify-between mb-6'>
        <h3
          className='
          text-xl font-bold text-foreground
          flex items-center gap-2
        '
        >
          <div className='p-2 rounded-lg bg-primary/10'>
            <BarChart3 className='w-5 h-5 text-primary' />
          </div>
          상담 통계
        </h3>
      </div>
      
      <div className='grid grid-cols-2 gap-6'>
        {/* 총 상담자 수 */}
        <div className='text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200'>
          <div className='flex items-center justify-center mb-2'>
            <div className='p-2 rounded-lg bg-blue-100'>
              <Users className='w-4 h-4 text-blue-600' />
            </div>
          </div>
          <div className='text-3xl font-bold text-blue-600 mb-1'>
            {isLoading ? '...' : totalCounselors}
          </div>
          <div className='text-sm font-medium text-muted-foreground'>
            총 상담 학생 수
          </div>
        </div>
        
        {/* 이번 주 상담 건수 */}
        <div className='text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200'>
          <div className='flex items-center justify-center mb-2'>
            <div className='p-2 rounded-lg bg-green-100'>
              <Calendar className='w-4 h-4 text-green-600' />
            </div>
          </div>
          <div className='text-3xl font-bold text-green-600 mb-1'>
            {isLoading ? '...' : weeklyCounselings}
          </div>
          <div className='text-sm font-medium text-muted-foreground'>
            이번 주 상담 수
          </div>
        </div>
      </div>
    </Card>
  );
};
