// 1. 내장 라이브러리
import { useCallback, useState } from 'react';

// 2. 외부 라이브러리
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Eye, EyeOff, Heart, Lock, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

// 3. 내부 모듈
import { Input } from '@/components/ui/forms/input';
import { Button } from '@/components/ui/interactive/button';
import { Card } from '@/components/ui/layout/card';
import { Label } from '@/components/ui/primitives/label';
import { useToast } from '@/hooks/use-toast';
import { useAuthActions } from '@/hooks/useAuthActions';

// 상수 정의
const LOGIN_MESSAGES = {
  EMAIL_REQUIRED: '올바른 이메일 주소를 입력해주세요',
  PASSWORD_MIN_LENGTH: '비밀번호는 8자 이상이어야 합니다',
  LOGIN_SUCCESS: '마음 캔버스에 오신 것을 환영합니다!',
  LOGIN_FAILED: '이메일 또는 비밀번호를 확인해주세요.',
  LOGIN_ERROR: '로그인 중 문제가 발생했습니다.',
  LOADING: '로그인 중...',
  PRIVACY_NOTICE:
    '모든 입력값은 안전하게 처리되며, 개인정보 보호 정책에 따라 관리됩니다.',
  SHOW_PASSWORD: '비밀번호 보기',
  HIDE_PASSWORD: '비밀번호 숨기기',
} as const;

const loginSchema = z.object({
  email: z.email({ message: LOGIN_MESSAGES.EMAIL_REQUIRED }),
  password: z.string().min(8, { message: LOGIN_MESSAGES.PASSWORD_MIN_LENGTH }),
});

interface LoginFormData extends z.infer<typeof loginSchema> {}

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthActions();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleTogglePassword = () => {
    setShowPassword(prev => !prev);
  };

  const onSubmit = useCallback(
    async (data: LoginFormData) => {
      setIsLoading(true);
      try {
        const success = await login(data.email, data.password);
        if (success) {
          toast({
            title: '로그인 성공',
            description: LOGIN_MESSAGES.LOGIN_SUCCESS,
          });
          navigate('/dashboard');
        } else {
          toast({
            title: '로그인 실패',
            description: LOGIN_MESSAGES.LOGIN_FAILED,
            variant: 'destructive',
          });
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : LOGIN_MESSAGES.LOGIN_ERROR;
        toast({
          title: '오류 발생',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [login, navigate, toast]
  );

  return (
    <div className='flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-warm'>
      <div className='w-full max-w-md mx-auto'>
        {/* 로그인 폼 */}
        <Card className='p-8 shadow-card border border-border/50 bg-card/80 backdrop-blur-sm animate-scale-in'>
          {/* 헤더 */}
          <div className='flex items-center justify-between mb-6'>
            <Link
              to='/user-role-selection'
              className='text-muted-foreground hover:text-foreground transition-colors'
            >
              <ArrowLeft className='w-5 h-5' />
            </Link>
            <div className='flex items-center'>
              <Heart className='w-5 h-5 text-primary mr-2' />
              <h1 className='text-lg font-bold text-foreground'>로그인</h1>
            </div>
            <div className='w-5' />
          </div>

          <div className='bg-orange-50 border border-orange-200 rounded-md p-3 mb-6'>
            <p className='text-sm text-orange-800'>
              {LOGIN_MESSAGES.PRIVACY_NOTICE}
            </p>
          </div>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {/* 이메일 */}
            <div className='space-y-2'>
              <Label htmlFor='email' className='text-foreground font-medium'>
                이메일
              </Label>
              <div className='relative'>
                <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
                <Input
                  {...form.register('email')}
                  type='email'
                  placeholder='example@email.com'
                  className='pl-10 bg-background/50 border-border focus:border-primary'
                />
              </div>
              {form.formState.errors.email && (
                <p className='text-destructive text-sm'>
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* 비밀번호 */}
            <div className='space-y-2'>
              <Label htmlFor='password' className='text-foreground font-medium'>
                비밀번호
              </Label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
                <Input
                  {...form.register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder='비밀번호 입력'
                  className='pl-10 pr-10 bg-background/50 border-border focus:border-primary'
                />
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={handleTogglePassword}
                  aria-label={
                    showPassword
                      ? LOGIN_MESSAGES.HIDE_PASSWORD
                      : LOGIN_MESSAGES.SHOW_PASSWORD
                  }
                  className='absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent'
                >
                  {showPassword ? (
                    <EyeOff className='w-4 h-4 text-muted-foreground' />
                  ) : (
                    <Eye className='w-4 h-4 text-muted-foreground' />
                  )}
                </Button>
              </div>
              {form.formState.errors.password && (
                <p className='text-destructive text-sm'>
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {/* 로그인 버튼 */}
            <Button
              type='submit'
              disabled={isLoading}
              className='w-full bg-primary hover:bg-primary-dark text-primary-foreground py-3 rounded-full shadow-soft font-medium text-lg'
            >
              {isLoading ? LOGIN_MESSAGES.LOADING : '로그인'}
            </Button>

            {/* 링크들 */}
            <div className='text-center space-y-2'>
              <p className='text-sm text-muted-foreground'>
                비밀번호를 잊어버리셨나요?{' '}
                <Link
                  to='/forgot-password'
                  className='text-primary hover:text-primary-dark font-medium'
                >
                  비밀번호 찾기
                </Link>
              </p>

              <p className='text-muted-foreground text-sm'>
                계정이 없으신가요?{' '}
                <Link
                  to='/user-role-selection'
                  className='text-primary hover:text-primary-dark font-medium'
                >
                  회원가입
                </Link>
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
