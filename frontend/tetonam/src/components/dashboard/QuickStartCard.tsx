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
        h-full flex flex-col
        p-6 shadow-card border border-border/50
        bg-card/80 backdrop-blur-sm
        transition-all duration-300
        micro-interaction
      '
    >
      <div className='text-center space-y-4 flex-1 flex flex-col justify-between'>
        <div className='space-y-4'>
          <div
            className={`w-16 h-16 mx-auto ${bgColor} rounded-2xl flex items-center justify-center shadow-soft transition-all duration-300`}
            role='img'
            aria-label={`${title} 아이콘`}
          >
            <Icon className={`w-8 h-8 ${iconColor}`} />
          </div>
          <h3 className='font-semibold text-foreground text-lg'>{title}</h3>
          <p className='text-sm text-muted-foreground leading-relaxed'>
            {description}
          </p>
        </div>
        <Button
          size='sm'
          variant={variant}
          className='w-full micro-interaction mt-auto'
          onClick={onAction}
          aria-label={`${title} 페이지로 이동`}
        >
          {actionText}
        </Button>
      </div>
    </Card>
  );
};
