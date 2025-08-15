import { Card } from '@/components/ui/layout/card';
import type { DailyTip } from '@/types/dashboard';
import { Lightbulb } from 'lucide-react';

interface DailyTipsProps {
  tips: readonly DailyTip[];
  userRole: 'COUNSELOR' | 'USER';
}

export const DailyTips = ({ tips, userRole }: DailyTipsProps) => {
  const getTitle = () => {
    return userRole === 'USER' ? '오늘의 마음 팁' : '상담사를 위한 팁';
  };

  return (
    <Card className='p-6 h-full'>
      {/* 헤더 */}
      <div className='flex items-center gap-3 mb-6'>
        <div className='p-2 rounded-lg bg-yellow-100'>
          <Lightbulb className='w-5 h-5 text-yellow-600' />
        </div>
        <div>
          <h3 className='text-lg font-bold text-foreground'>
            {getTitle()}
          </h3>
          <p className='text-sm text-muted-foreground'>
            {userRole === 'USER' ? '마음건강을 위한 조언' : '전문가를 위한 실무 가이드'}
          </p>
        </div>
      </div>

      {/* 팁 목록 */}
      <div className='space-y-3'>
        {tips.map((tip, index) => (
          <div
            key={index}
            className='p-4 rounded-lg border border-border bg-card hover:shadow-md transition-all duration-200 hover:border-primary/30'
          >
            <h4 className='font-semibold text-sm text-foreground mb-2'>
              {tip.title}
            </h4>
            <p className='text-sm text-muted-foreground leading-relaxed'>
              {tip.content}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};
