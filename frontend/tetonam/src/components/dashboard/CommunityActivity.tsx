import { Button } from '@/components/ui/interactive/button';
import { Card } from '@/components/ui/layout/card';
import type { CommunityActivity as CommunityActivityType } from '@/types/dashboard';
import { Award, MessageCircle } from 'lucide-react';

interface CommunityActivityProps {
  activities: CommunityActivityType[];
}

export const CommunityActivity = ({ activities }: CommunityActivityProps) => {
  const handleViewMore = () => {
    // TODO: 더 많은 활동 보기 페이지로 이동
  };

  const getActivityIcon = (type: 'contribution' | 'achievement') => {
    return type === 'contribution' ? Award : Award;
  };

  const getActivityColor = (type: 'contribution' | 'achievement') => {
    return type === 'contribution' ? 'text-primary' : 'text-secondary';
  };

  const getActivityBg = (type: 'contribution' | 'achievement') => {
    return type === 'contribution' ? 'bg-primary/5' : 'bg-secondary/10';
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
          <MessageCircle className='w-5 h-5 text-primary mr-2' />
          커뮤니티 활동
        </h3>
      </div>
      <div className='space-y-3'>
        {activities.map((activity, index) => {
          const Icon = getActivityIcon(activity.type);
          const iconColor = getActivityColor(activity.type);
          const bgColor = getActivityBg(activity.type);

          return (
            <div
              key={index}
              className={`p-3 ${bgColor} rounded-lg`}
              role='listitem'
              aria-label={`커뮤니티 활동: ${activity.title}`}
            >
              <div className='flex items-start space-x-3'>
                <Icon className={`w-5 h-5 ${iconColor} mt-1`} />
                <div>
                  <h4 className='font-medium text-foreground'>
                    {activity.title}
                  </h4>
                  <p className='text-sm text-muted-foreground'>
                    {activity.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        <Button
          variant='outline'
          className='w-full'
          onClick={handleViewMore}
          aria-label='더 많은 커뮤니티 활동 보기'
        >
          더 많은 활동 보기
        </Button>
      </div>
    </Card>
  );
};
