import { cn } from '@/utils/cn';
import { Loader2 } from 'lucide-react';
import { Button, ButtonProps } from './interactive/button';

interface ApiButtonProps extends Omit<ButtonProps, 'onClick'> {
  onClick: () => Promise<void> | void;
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const ApiButton = ({
  onClick,
  isLoading = false,
  loadingText,
  children,
  className,
  disabled,
  ...props
}: ApiButtonProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(className)}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className='w-4 h-4 mr-2 animate-spin' />
          {loadingText || children}
        </>
      ) : (
        children
      )}
    </Button>
  );
};
