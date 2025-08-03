// 1. 내장 라이브러리
import { useCallback, useState } from 'react';

// 2. 외부 라이브러리
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

// 3. 내부 모듈
import { EmailInput } from '@/components/ui/forms/EmailInput';
import { FormLayout } from '@/components/ui/forms/FormLayout';
import { PasswordInput } from '@/components/ui/forms/PasswordInput';
import { PrivacyNotice } from '@/components/ui/forms/PrivacyNotice';
import { Button } from '@/components/ui/interactive/button';
import { FORM_MESSAGES } from '@/constants/forms';
import { useAuthActions } from '@/hooks/useAuthActions';

const loginSchema = z.object({
  email: z.email({ message: FORM_MESSAGES.VALIDATION.EMAIL_INVALID }),
  password: z
    .string()
    .min(8, { message: FORM_MESSAGES.VALIDATION.PASSWORD_MIN }),
});

interface LoginFormData extends z.infer<typeof loginSchema> {}

export const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login } = useAuthActions();
  const navigate = useNavigate();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = useCallback(
    async (data: LoginFormData) => {
      setIsLoading(true);
      setIsSuccess(false);
      setErrorMessage(null);

      try {
        const success = await login(data.email, data.password);
        if (success) {
          setIsSuccess(true);
          // 체크 아이콘을 잠깐 보여준 후 대시보드로 이동
          setTimeout(() => {
            navigate('/dashboard');
          }, 1000);
        } else {
          setErrorMessage('이메일 또는 비밀번호를 확인해주세요.');
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : '로그인 중 문제가 발생했습니다.';
        setErrorMessage(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [login, navigate]
  );

  return (
    <FormLayout title='로그인'>
      <PrivacyNotice message={FORM_MESSAGES.PRIVACY.LOGIN} className='mb-8' />

      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <div>
          <EmailInput
            label='이메일'
            {...form.register('email')}
            error={form.formState.errors.email?.message || undefined}
          />
        </div>

        <div>
          <PasswordInput
            label='비밀번호'
            {...form.register('password')}
            error={form.formState.errors.password?.message || undefined}
          />
        </div>

        {errorMessage && (
          <div>
            <div className='p-4 bg-destructive/10 border border-destructive/20 rounded-xl'>
              <p className='text-destructive text-sm' role='alert'>
                {errorMessage}
              </p>
            </div>
          </div>
        )}

        <div>
          <Button
            type='submit'
            disabled={isLoading || isSuccess}
            className='w-full bg-gradient-mint hover:bg-mint-dark text-white py-4 rounded-2xl shadow-soft hover:shadow-medium font-medium text-lg transform-gpu'
          >
            {isLoading ? (
              <Loader2 className='w-6 h-6 animate-spin' />
            ) : isSuccess ? (
              <Check className='w-6 h-6' />
            ) : (
              '로그인'
            )}
          </Button>
        </div>

        <div className='text-center space-y-4'>
          <p className='text-sm text-muted-foreground'>
            비밀번호를 잊어버리셨나요?{' '}
            <Link
              to='/forgot-password'
              className='text-mint hover:text-mint-dark font-medium micro-interaction'
            >
              비밀번호 찾기
            </Link>
          </p>

          <p className='text-muted-foreground text-sm'>
            계정이 없으신가요?{' '}
            <Link
              to='/user-role-selection'
              className='text-mint hover:text-mint-dark font-medium micro-interaction'
            >
              회원가입
            </Link>
          </p>
        </div>
      </form>
    </FormLayout>
  );
};
