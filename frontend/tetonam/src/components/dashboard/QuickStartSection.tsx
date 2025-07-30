import type { QuickAction } from '@/types/dashboard';
import { BarChart3, BookOpen, Calendar, Heart, Users } from 'lucide-react';
import { QuickStartCard } from './QuickStartCard';

interface QuickStartSectionProps {
  actions: readonly QuickAction[];
  userType: 'counselor' | 'student';
}

export const QuickStartSection = ({
  actions,
  userType,
}: QuickStartSectionProps) => {
  const getIcon = (title: string) => {
    const iconMap = {
      '내 일정 관리하기': Calendar,
      '학생 상담 시작하기': Users,
      커뮤니티: BarChart3,
      '상담 예약하기': Heart,
      '내 마음 진단하기': BookOpen,
    };
    return iconMap[title as keyof typeof iconMap] || Users;
  };

  const getIconStyles = (index: number) => {
    const styles = [
      { bg: 'bg-primary/10', color: 'text-primary' },
      { bg: 'bg-secondary/20', color: 'text-secondary-foreground' },
      { bg: 'bg-accent/50', color: 'text-accent-foreground' },
    ] as const;
    return styles[index % styles.length]!;
  };

  const handleAction = (action: QuickAction) => {
    // TODO: 실제 액션 구현
    console.log(`Action: ${action.title}`);
  };

  return (
    <div>
      <h2 className='text-xl font-semibold text-foreground mb-4'>
        {userType === 'counselor' ? '퀵 시작' : '빠른 시작'}
      </h2>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {actions.map((action, index) => {
          const Icon = getIcon(action.title);
          const { bg, color } = getIconStyles(index);

          return (
            <QuickStartCard
              key={action.title}
              title={action.title}
              description={action.description}
              icon={Icon}
              actionText={action.actionText}
              variant={action.variant}
              onAction={() => handleAction(action)}
              bgColor={bg}
              iconColor={color}
            />
          );
        })}
      </div>
    </div>
  );
};
