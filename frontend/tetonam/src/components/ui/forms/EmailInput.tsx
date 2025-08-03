import { Mail } from 'lucide-react';

import { Label } from '../primitives/label';
import { Input } from './input';

interface EmailInputProps {
  label?: string;
  placeholder?: string;
  error?: string | undefined;
  className?: string;
  id?: string;
  'aria-describedby'?: string;
  [key: string]: any; // react-hook-form의 register props를 위한 spread
}

export const EmailInput = ({
  label,
  placeholder = 'example@email.com',
  error,
  className,
  id,
  'aria-describedby': ariaDescribedBy,
  ...props
}: EmailInputProps) => {
  return (
    <div className='space-y-2'>
      {label && (
        <Label htmlFor={id} className='text-foreground font-medium'>
          {label}
        </Label>
      )}
      <div className='relative'>
        <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
        <Input
          id={id}
          type='email'
          placeholder={placeholder}
          className='pl-10 bg-background/50 border-border focus:border-primary'
          aria-describedby={ariaDescribedBy}
          {...props}
        />
      </div>
      {error && <p className='text-destructive text-sm'>{error}</p>}
    </div>
  );
};
