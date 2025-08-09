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
        p-6 shadow-card border border-border/50
        bg-card/80 backdrop-blur-sm
        hover:shadow-hover hover:scale-[1.02] transition-all duration-300
        cursor-pointer micro-interaction
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
      <div className='text-center space-y-4'>
        <div
          className={`w-16 h-16 mx-auto ${bgColor} rounded-2xl flex items-center justify-center shadow-soft transition-all duration-300 hover:scale-110`}
          role='img'
          aria-label={`${title} 아이콘`}
        >
          <Icon className={`w-8 h-8 ${iconColor}`} />
        </div>
        <h3 className='font-semibold text-foreground text-lg'>{title}</h3>
        <p className='text-sm text-muted-foreground leading-relaxed'>
          {description}
        </p>
        <Button
          size='sm'
          variant={variant}
          className='w-full micro-interaction'
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
