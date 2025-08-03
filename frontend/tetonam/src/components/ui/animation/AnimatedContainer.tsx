import * as React from 'react';

import { cn } from '@/utils/cn';

interface AnimatedContainerProps {
  children: React.ReactNode;
  delay?: number;
  animation?:
    | 'fade-in'
    | 'scale-gentle'
    | 'slide-up'
    | 'slide-down'
    | 'slide-left'
    | 'slide-right';
  className?: string;
  disabled?: boolean;
}

export const AnimatedContainer = ({
  children,
  delay = 0,
  animation = 'fade-in',
  className,
  disabled = false,
}: AnimatedContainerProps) => {
  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={cn(`animate-${animation}`, className)}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
};
