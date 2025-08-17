// 1. 내장 라이브러리
import { useCallback, useEffect, useState } from 'react';

// 2. 외부 라이브러리
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';

// 3. 내부 모듈
import { EmailInput } from '@/components/ui/forms/EmailInput';
import { FormLayout } from '@/components/ui/forms/FormLayout';
import { PasswordInput } from '@/components/ui/forms/PasswordInput';
import { PrivacyNotice } from '@/components/ui/forms/PrivacyNotice';
import { ApiButton } from '@/components/ui/ApiButton';
import { FORM_MESSAGES } from '@/constants/forms';
import { useAuthActions } from '@/hooks/useAuthActions';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSubmitButton } from '@/hooks/useSubmitButton';

const loginSchema = z.object({
  email: z.email({ message: FORM_MESSAGES.VALIDATION.EMAIL_INVALID }),
  password: z
    .string()
    .min(8, { message: FORM_MESSAGES.VALIDATION.PASSWORD_MIN }),
});

interface LoginFormData extends z.infer<typeof loginSchema> {}

export const LoginForm = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login } = useAuthActions();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // 이미 로그인된 경우 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const { handleSubmit, isLoading, isSuccess } = useSubmitButton({
    mutationFn: async (data: LoginFormData) => {
      const success = await login(data.email, data.password);
      if (!success) {
        throw new Error('이메일 또는 비밀번호를 확인해주세요.');
      }
      return success;
    },
    onSuccess: () => {
      setErrorMessage(null);
      // 체크 아이콘을 잠깐 보여준 후 원래 페이지로 이동
      setTimeout(() => {
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }, 1000);
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });

  const onSubmit = useCallback(
    async (data: LoginFormData) => {
      setErrorMessage(null); // 폼 제출 시 에러 메시지 초기화
      await handleSubmit(data);
    },
    [handleSubmit]
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

        {/* 인라인 에러 메시지 */}
        {errorMessage && (
          <div className='p-4 bg-destructive/10 border border-destructive/20 rounded-xl'>
            <p className='text-destructive text-sm' role='alert'>
              {errorMessage}
            </p>
          </div>
        )}

        <div>
          <ApiButton
            type='submit'
            isLoading={isLoading}
            loadingText='로그인 중...'
            onClick={() => {}} // 폼 제출은 onSubmit에서 처리되므로 빈 함수
            className='w-full bg-gradient-mint hover:bg-mint-dark text-white py-4 rounded-2xl shadow-soft hover:shadow-medium font-medium text-lg transform-gpu'
          >
            {isSuccess ? '로그인 성공!' : '로그인'}
          </ApiButton>
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
