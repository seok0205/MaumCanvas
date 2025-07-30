import { Input } from '@/components/ui/forms/input';
import { Button } from '@/components/ui/interactive/button';
import { Label } from '@/components/ui/primitives/label';
import { PASSWORD_RESET_CONSTANTS } from '@/constants/passwordReset';
import {
  verificationSchema,
  type VerificationFormData,
} from '@/types/passwordReset';
import { zodResolver } from '@hookform/resolvers/zod';
import { Key } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface VerificationStepFormProps {
  email: string;
  onSubmit: (data: VerificationFormData) => Promise<void>;
  onResendCode: () => Promise<void>;
  isLoading: boolean;
}

export const VerificationStepForm = ({
  email,
  onSubmit,
  onResendCode,
  isLoading,
}: VerificationStepFormProps) => {
  const form = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
  });

  const handleSubmit = async (data: VerificationFormData) => {
    await onSubmit(data);
  };

  const handleResendCode = async () => {
    await onResendCode();
  };

  return (
    <div className='space-y-6'>
      <div className='bg-secondary/30 border border-secondary/50 rounded-lg p-4'>
        <p className='text-sm text-foreground text-center'>
          {email}로 인증 코드를 발송했습니다.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
        <div className='space-y-2'>
          <Label htmlFor='code' className='text-foreground font-medium'>
            인증 코드
          </Label>
          <div className='relative'>
            <Key
              className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4'
              aria-hidden='true'
            />
            <Input
              {...form.register('code')}
              placeholder='123456'
              className='pl-10 bg-background/50 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-center text-lg tracking-wider'
              maxLength={PASSWORD_RESET_CONSTANTS.VERIFICATION_CODE_LENGTH}
              aria-describedby='code-error'
            />
          </div>
          {form.formState.errors.code && (
            <p
              id='code-error'
              className='text-destructive text-sm'
              role='alert'
            >
              {form.formState.errors.code.message}
            </p>
          )}
        </div>

        <div className='text-center'>
          <p className='text-muted-foreground text-sm mb-2'>
            이메일을 받지 못하셨나요?
          </p>
          <Button
            type='button'
            variant='link'
            onClick={handleResendCode}
            className='text-primary hover:text-primary-dark p-0 h-auto font-medium'
          >
            인증 코드 재전송
          </Button>
        </div>

        <Button
          type='submit'
          disabled={isLoading}
          className='w-full bg-primary hover:bg-primary-dark text-primary-foreground py-3 rounded-full shadow-soft font-medium'
        >
          {isLoading ? '인증 중...' : '인증 확인'}
        </Button>
      </form>
    </div>
  );
};
