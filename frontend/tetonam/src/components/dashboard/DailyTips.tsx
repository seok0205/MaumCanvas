import { Card } from '@/components/ui/layout/card';
import type { DailyTip } from '@/types/dashboard';

interface DailyTipsProps {
  tips: readonly DailyTip[];
  userType: 'counselor' | 'student';
}

export const DailyTips = ({ tips, userType }: DailyTipsProps) => {
  return (
    <Card
      className='
      p-6 shadow-card border border-border/50
      bg-card/80 backdrop-blur-sm
    '
    >
      <h3 className='text-lg font-semibold text-foreground mb-4'>오늘의 팁</h3>
      <div
        className={
          userType === 'student'
            ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
            : 'space-y-4'
        }
      >
        {tips.map((tip, index) => {
          const bgColor = index === 0 ? 'bg-primary/5' : 'bg-secondary/10';

          return (
            <div
              key={tip.title}
              className={`p-4 ${bgColor} rounded-lg`}
              role='article'
              aria-label={`오늘의 팁: ${tip.title}`}
            >
              <h4 className='font-medium text-foreground mb-2'>{tip.title}</h4>
              <p className='text-sm text-muted-foreground'>{tip.content}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
