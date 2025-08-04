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
        'flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-mint/10 via-yellow/5 to-light-blue/10',
        className
      )}
    >
      <div className='w-full max-w-md mx-auto'>
        <Card
          className={cn(
            'p-8 shadow-card border border-border/30 bg-card/90 backdrop-blur-sm',
            cardClassName
          )}
        >
          {showBackButton && (
            <div className='flex items-center justify-between mb-8'>
              <Link
                to={backTo}
                className='text-muted-foreground hover:text-foreground transition-colors duration-200 p-2 rounded-xl hover:bg-muted/50'
                aria-label='이전 페이지로 돌아가기'
              >
                <ArrowLeft className='w-6 h-6' />
              </Link>
              <div className='flex items-center'>
                <Heart className='w-6 h-6 text-mint mr-3' />
                <h1 className='text-xl font-bold text-foreground'>{title}</h1>
              </div>
              <div className='w-6' />
            </div>
          )}
          {children}
        </Card>
      </div>
    </div>
  );
};
