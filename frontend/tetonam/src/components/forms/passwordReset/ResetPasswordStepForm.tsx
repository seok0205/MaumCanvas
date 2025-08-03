import { Input } from '@/components/ui/forms/input';
import { Button } from '@/components/ui/interactive/button';
import { Label } from '@/components/ui/primitives/label';
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '@/types/passwordReset';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Key } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface ResetPasswordStepFormProps {
  onSubmit: (data: ResetPasswordFormData) => Promise<void>;
  isLoading: boolean;
}

export const ResetPasswordStepForm = ({
  onSubmit,
  isLoading,
}: ResetPasswordStepFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
  });

  const handleSubmit = async (data: ResetPasswordFormData) => {
    await onSubmit(data);
  };

  const handleTogglePassword = () => {
    setShowPassword(prev => !prev);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(prev => !prev);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
      <div className='space-y-2'>
        <Label htmlFor='password' className='text-foreground font-medium'>
          새 비밀번호
        </Label>
        <div className='relative'>
          <Key
            className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4'
            aria-hidden='true'
          />
          <Input
            {...form.register('password')}
            type={showPassword ? 'text' : 'password'}
            placeholder='8-15자리 비밀번호'
            className='pl-10 pr-10 bg-background/50 border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
            aria-describedby='password-error'
          />
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={handleTogglePassword}
            className='absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent'
            aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
          >
            {showPassword ? (
              <EyeOff
                className='w-4 h-4 text-muted-foreground'
                aria-hidden='true'
              />
            ) : (
              <Eye
                className='w-4 h-4 text-muted-foreground'
                aria-hidden='true'
              />
            )}
          </Button>
        </div>
        {form.formState.errors.password && (
          <p
            id='password-error'
            className='text-destructive text-sm'
            role='alert'
          >
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      <div className='space-y-2'>
        <Label
          htmlFor='confirmPassword'
          className='text-foreground font-medium'
        >
          비밀번호 확인
        </Label>
        <div className='relative'>
          <Key
            className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4'
            aria-hidden='true'
          />
          <Input
            {...form.register('confirmPassword')}
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder='비밀번호 재입력'
            className='pl-10 pr-10 bg-background/50 border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
            aria-describedby='confirm-password-error'
          />
          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={handleToggleConfirmPassword}
            className='absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent'
            aria-label={
              showConfirmPassword
                ? '비밀번호 확인 숨기기'
                : '비밀번호 확인 보기'
            }
          >
            {showConfirmPassword ? (
              <EyeOff
                className='w-4 h-4 text-muted-foreground'
                aria-hidden='true'
              />
            ) : (
              <Eye
                className='w-4 h-4 text-muted-foreground'
                aria-hidden='true'
              />
            )}
          </Button>
        </div>
        {form.formState.errors.confirmPassword && (
          <p
            id='confirm-password-error'
            className='text-destructive text-sm'
            role='alert'
          >
            {form.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button
        type='submit'
        disabled={isLoading}
        className='w-full bg-primary hover:bg-primary-dark text-primary-foreground py-3 rounded-full shadow-soft font-medium'
      >
        {isLoading ? '변경 중...' : '비밀번호 재설정'}
      </Button>
    </form>
  );
};
