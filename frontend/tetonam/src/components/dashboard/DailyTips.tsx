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
          <Lightbulb className='w-5 h-5 text-primary mr-2' />
          {getTitle()}
        </h3>
      </div>

      <div className='space-y-4'>
        {tips.map((tip, index) => (
          <div
            key={index}
            className='p-4 bg-accent/30 rounded-lg border border-border/30'
          >
            <h4 className='font-medium text-foreground mb-2'>{tip.title}</h4>
            <p className='text-sm text-muted-foreground leading-relaxed'>
              {tip.content}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};
