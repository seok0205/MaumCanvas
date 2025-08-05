import { ApiButton } from '@/components/ui/ApiButton';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/primitives/label';
import { emailSchema, type EmailFormData } from '@/types/passwordReset';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface EmailStepFormProps {
  onSubmit: (data: EmailFormData) => Promise<void>;
  isLoading: boolean;
  message?: { type: 'success' | 'error'; message: string } | null;
}

export const EmailStepForm = ({
  onSubmit,
  isLoading,
  message,
}: EmailStepFormProps) => {
  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    mode: 'onBlur',
  });

  const handleSubmit = async (data: EmailFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
      <div className='space-y-2'>
        <Label htmlFor='email' className='text-foreground font-medium'>
          이메일
        </Label>
        <div className='relative'>
          <Mail
            className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4'
            aria-hidden='true'
          />
          <Input
            {...form.register('email')}
            type='email'
            placeholder='example@email.com'
            className='pl-10 bg-background/50 border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
            aria-describedby='email-error'
          />
        </div>
        {form.formState.errors.email && (
          <p id='email-error' className='text-destructive text-sm' role='alert'>
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      {/* 인라인 메시지 (성공/에러) */}
      {message && (
        <div
          className={`p-3 border rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200'
              : 'bg-destructive/10 border-destructive/20'
          }`}
        >
          <p
            className={`text-sm ${
              message.type === 'success' ? 'text-green-700' : 'text-destructive'
            }`}
            role='alert'
          >
            {message.message}
          </p>
        </div>
      )}

      <ApiButton
        type='submit'
        isLoading={isLoading}
        loadingText='인증 코드 전송 중...'
        onClick={() => {}} // 폼 제출은 onSubmit에서 처리되므로 빈 함수
        className='w-full bg-primary hover:bg-primary-dark text-primary-foreground py-3 rounded-full shadow-soft font-medium'
      >
        인증 코드 전송
      </ApiButton>
    </form>
  );
};
