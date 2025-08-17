import { Eye, EyeOff, Lock } from 'lucide-react';
import { useState } from 'react';

import { FORM_MESSAGES } from '@/constants/forms';
import { Button } from '../interactive/button';
import { Label } from '../primitives/label';
import { Input } from './input';

interface PasswordInputProps {
  label?: string;
  placeholder?: string;
  error?: string | undefined;
  showToggle?: boolean;
  className?: string;
  id?: string;
  'aria-describedby'?: string;
  [key: string]: any; // react-hook-form의 register props를 위한 spread
}

export const PasswordInput = ({
  label,
  placeholder = '비밀번호 입력',
  error,
  showToggle = true,
  className,
  id,
  'aria-describedby': ariaDescribedBy,
  ...props
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => setShowPassword(prev => !prev);

  return (
    <div className='space-y-2'>
      {label && (
        <Label htmlFor={id} className='text-foreground font-medium'>
          {label}
        </Label>
      )}
      <div className='relative'>
        <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
        <Input
          id={id}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          className='pl-10 pr-10 bg-background/50 border-border focus:border-primary'
          aria-describedby={ariaDescribedBy}
          {...props}
        />
        {showToggle && (
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={togglePassword}
            aria-label={
              showPassword
                ? FORM_MESSAGES.PASSWORD.HIDE
                : FORM_MESSAGES.PASSWORD.SHOW
            }
            className='absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent'
          >
            {showPassword ? (
              <EyeOff className='w-4 h-4 text-muted-foreground' />
            ) : (
              <Eye className='w-4 h-4 text-muted-foreground' />
            )}
          </Button>
        )}
      </div>
      {error && <p className='text-destructive text-sm'>{error}</p>}
    </div>
  );
};
