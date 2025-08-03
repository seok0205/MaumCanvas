import { ArrowLeft, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

import { cn } from '@/utils/cn';
import { Card } from '../layout/card';

interface FormLayoutProps {
  title: string;
  children: React.ReactNode;
  showBackButton?: boolean;
  backTo?: string;
  className?: string;
  cardClassName?: string;
}

export const FormLayout = ({
  title,
  children,
  showBackButton = true,
  backTo = '/user-role-selection',
  className,
  cardClassName,
}: FormLayoutProps) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-warm',
        className
      )}
    >
      <div className='w-full max-w-md mx-auto'>
        <Card
          className={cn(
            'p-8 shadow-card border border-border/50 bg-card/80 backdrop-blur-sm animate-scale-in',
            cardClassName
          )}
        >
          {showBackButton && (
            <div className='flex items-center justify-between mb-6'>
              <Link
                to={backTo}
                className='text-muted-foreground hover:text-foreground transition-colors'
                aria-label='이전 페이지로 돌아가기'
              >
                <ArrowLeft className='w-5 h-5' />
              </Link>
              <div className='flex items-center'>
                <Heart className='w-5 h-5 text-primary mr-2' />
                <h1 className='text-lg font-bold text-foreground'>{title}</h1>
              </div>
              <div className='w-5' />
            </div>
          )}
          {children}
        </Card>
      </div>
    </div>
  );
};
