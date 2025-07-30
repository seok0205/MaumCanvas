import { Button } from '@/components/ui/interactive/button';
import { Card } from '@/components/ui/layout/card';
import type { LucideIcon } from 'lucide-react';

interface QuickStartCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionText: string;
  variant: 'default' | 'outline';
  onAction: () => void;
  bgColor: string;
  iconColor: string;
}

export const QuickStartCard = ({
  title,
  description,
  icon: Icon,
  actionText,
  variant,
  onAction,
  bgColor,
  iconColor,
}: QuickStartCardProps) => {
  return (
    <Card
      className='
        p-4 shadow-card border border-border/50
        bg-card/80 backdrop-blur-sm
        hover:shadow-medium transition-all duration-300
      '
      role='button'
      tabIndex={0}
      onClick={onAction}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onAction();
        }
      }}
      aria-label={`${title} - ${description}`}
    >
      <div className='text-center space-y-3'>
        <div
          className={`w-12 h-12 mx-auto ${bgColor} rounded-full flex items-center justify-center`}
          role='img'
          aria-label={`${title} 아이콘`}
        >
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <h3 className='font-semibold text-foreground'>{title}</h3>
        <p className='text-sm text-muted-foreground'>{description}</p>
        <Button
          size='sm'
          variant={variant}
          className='w-full'
          onClick={e => {
            e.stopPropagation();
            onAction();
          }}
          aria-label={`${title} 페이지로 이동`}
        >
          {actionText}
        </Button>
      </div>
    </Card>
  );
};
