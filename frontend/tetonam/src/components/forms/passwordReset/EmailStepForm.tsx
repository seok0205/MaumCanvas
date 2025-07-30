import { Input } from '@/components/ui/forms/input';
import { Button } from '@/components/ui/interactive/button';
import { Label } from '@/components/ui/primitives/label';
import { emailSchema, type EmailFormData } from '@/types/passwordReset';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface EmailStepFormProps {
  onSubmit: (data: EmailFormData) => Promise<void>;
  isLoading: boolean;
}

export const EmailStepForm = ({ onSubmit, isLoading }: EmailStepFormProps) => {
  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
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

      <Button
        type='submit'
        disabled={isLoading}
        className='w-full bg-primary hover:bg-primary-dark text-primary-foreground py-3 rounded-full shadow-soft font-medium'
      >
        {isLoading ? '전송 중...' : '인증 코드 전송'}
      </Button>
    </form>
  );
};
