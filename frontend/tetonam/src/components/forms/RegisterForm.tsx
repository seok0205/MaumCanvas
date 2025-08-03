// 내장 라이브러리
import { useCallback, useEffect, useMemo, useState } from 'react';

// 외부 라이브러리
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  Eye,
  EyeOff,
  Heart,
  Loader2,
  Lock,
  Mail,
  Phone,
  User,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

// 내부 모듈
import { Input } from '@/components/ui/forms/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';
import { Button } from '@/components/ui/interactive/button';
import { Card } from '@/components/ui/layout/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/overlay/dialog';
import { Label } from '@/components/ui/primitives/label';
import { useAuthActions } from '@/hooks/useAuthActions';
import { useEmailVerification } from '@/hooks/useEmailVerification';
import { useNicknameCheck } from '@/hooks/useNicknameCheck';
import { useAuthStore } from '@/stores/useAuthStore';
import { roleToRolesArray } from '@/utils/userRoleMapping';

const registerSchema = z
  .object({
    name: z.string().min(2, { message: '이름은 2자 이상 입력해주세요' }),
    organization: z.string().min(2, { message: '소속을 입력해주세요' }),
    birthDate: z.string().min(1, { message: '생년월일을 입력해주세요' }),
    email: z.email({ message: '올바른 이메일 주소를 입력해주세요' }),
    emailVerificationCode: z.string().optional(),
    phone: z.string().min(10, { message: '올바른 휴대폰 번호를 입력해주세요' }),
    password: z
      .string()
      .min(8, { message: '비밀번호는 8자 이상이어야 합니다' })
      .max(15, { message: '비밀번호는 15자 이하여야 합니다' })
      .regex(/^(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])/, {
        message: '영문, 숫자, 특수문자를 포함해야 합니다',
      }),
    confirmPassword: z.string(),
    gender: z.string().min(1, { message: '성별을 선택해주세요' }),
    nickname: z.string().min(2, { message: '닉네임은 2자 이상 입력해주세요' }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterResultDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isSuccess: boolean;
  onLoginClick?: () => void;
}

const RegisterResultDialog = ({
  isOpen,
  onClose,
  isSuccess,
  onLoginClick,
}: RegisterResultDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-center'>
          <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100'>
            {isSuccess ? (
              <CheckCircle className='h-6 w-6 text-green-600' />
            ) : (
              <AlertTriangle className='h-6 w-6 text-orange-600' />
            )}
          </div>
          <DialogTitle className='text-lg font-semibold text-foreground'>
            {isSuccess ? '회원가입 성공' : '회원가입 실패'}
          </DialogTitle>
          <DialogDescription className='text-sm text-muted-foreground'>
            {isSuccess
              ? '마음 캔버스에 오신 것을 환영합니다! 로그인을 진행해주세요.'
              : '회원가입에 실패했습니다. 다시 시도해주세요.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className='flex flex-col sm:flex-row gap-2'>
          {isSuccess ? (
            <Button onClick={onLoginClick} className='w-full sm:w-auto'>
              로그인하러 가기
            </Button>
          ) : (
            <Button
              onClick={onClose}
              variant='outline'
              className='w-full sm:w-auto'
            >
              확인
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showRegisterResultModal, setShowRegisterResultModal] = useState(false);
  const [registerResult, setRegisterResult] = useState<{
    isSuccess: boolean;
  }>({ isSuccess: false });
  const [nicknameVerified, setNicknameVerified] = useState(false);

  const { register } = useAuthActions();
  const { selectedUserRole } = useAuthStore();
  const navigate = useNavigate();
  const {
    isEmailSent,
    isEmailVerified,
    sendEmailVerification,
    verifyEmail,
    resetState: resetEmailState,
    error: emailError,
    successMessage: emailSuccessMessage,
    isLoading: emailLoading,
  } = useEmailVerification();
  const {
    checkNickname,
    error: nicknameError,
    successMessage: nicknameSuccessMessage,
    isLoading: nicknameLoading,
  } = useNicknameCheck();

  // 현재 날짜 정보 (컴포넌트 마운트 시점 고정)
  const currentDate = useMemo(() => new Date(), []);
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 1-based
  const currentDay = currentDate.getDate();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      organization: '',
      email: '',
      emailVerificationCode: '',
      phone: '',
      password: '',
      confirmPassword: '',
      gender: '',
      nickname: '',
      birthDate: '',
    },
  });

  // 생년월일 유효성 검사 함수
  const validateBirthDate = useCallback(
    (value: string): string | true => {
      if (!value) return '생년월일을 입력해주세요';

      const inputDate = new Date(value);

      // 유효한 날짜인지 검사
      if (isNaN(inputDate.getTime())) {
        return '유효한 생년월일을 입력해주세요';
      }

      // 미래 날짜 검사
      if (inputDate > currentDate) {
        return '유효한 생년월일을 입력해주세요';
      }

      // 최소 나이 검사 (1900년 이전)
      if (inputDate.getFullYear() < 1900) {
        return '유효한 생년월일을 입력해주세요';
      }

      return true;
    },
    [currentDate]
  );

  // 이메일 변경 시 인증 상태 리셋
  useEffect(() => {
    const subscription = form.watch((_value, { name }) => {
      if (name === 'email') {
        resetEmailState();
      }
    });
    return () => subscription.unsubscribe();
  }, [form, resetEmailState]);

  // 닉네임 변경 시 중복 체크 상태 리셋
  useEffect(() => {
    const subscription = form.watch((_value, { name }) => {
      if (name === 'nickname') {
        setNicknameVerified(false);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // 사용자 역할이 선택되지 않은 경우 UserRoleSelection 페이지로 리다이렉트
  useEffect(() => {
    if (!selectedUserRole) {
      // 즉시 리다이렉트하여 불필요한 렌더링 방지
      navigate('/user-role-selection', { replace: true });
    }
  }, [selectedUserRole, navigate]);

  const onSubmit = useCallback(
    async (data: RegisterFormData) => {
      // UserRole이 없으면 이미 useEffect에서 리다이렉트되므로 여기서는 체크 불필요
      if (!selectedUserRole) {
        // 추가 안전장치: UserRole이 없으면 리다이렉트
        navigate('/user-role-selection', { replace: true });
        return;
      }

      setIsLoading(true);
      try {
        const success = await register({
          name: data.name,
          email: data.email,
          password: data.password,
          nickname: data.nickname,
          gender: data.gender.toUpperCase() as 'MALE' | 'FEMALE' | 'OTHERS',
          phone: data.phone,
          school: {
            name: data.organization,
          },
          birthday: data.birthDate,
          roles: roleToRolesArray(selectedUserRole),
        });

        setRegisterResult({ isSuccess: success });
        setShowRegisterResultModal(true);
      } catch (error) {
        setRegisterResult({ isSuccess: false });
        setShowRegisterResultModal(true);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedUserRole, register, navigate]
  );

  const handleRegisterResultClose = useCallback(() => {
    setShowRegisterResultModal(false);
    if (!registerResult.isSuccess) {
      // 실패 시 UserRoleSelection으로 돌아가서 다시 시도할 수 있도록 함
      navigate('/user-role-selection');
    }
  }, [registerResult.isSuccess, navigate]);

  const handleLoginClick = useCallback(() => {
    setShowRegisterResultModal(false);
    navigate('/login');
  }, [navigate]);

  // 이메일 인증 성공 처리
  const handleEmailVerification = useCallback(async () => {
    const email = form.getValues('email');
    const code = form.getValues('emailVerificationCode') || '';

    // AbortController를 사용하여 요청 취소 가능하게 함
    const abortController = new AbortController();

    try {
      await verifyEmail(email, code, abortController.signal);
    } catch (error) {
      // AbortError는 사용자에게 표시하지 않음
      if (error instanceof Error && error.name !== 'AbortError') {
        // 에러는 useEmailVerification 훅에서 처리됨
      }
    }
  }, [verifyEmail, form]);

  // 닉네임 중복 체크 성공 처리
  const handleNicknameCheck = useCallback(async () => {
    const nickname = form.getValues('nickname');

    // AbortController를 사용하여 요청 취소 가능하게 함
    const abortController = new AbortController();

    try {
      await checkNickname(nickname, abortController.signal);
      setNicknameVerified(true);
    } catch (error) {
      // AbortError는 사용자에게 표시하지 않음
      if (error instanceof Error && error.name !== 'AbortError') {
        setNicknameVerified(false);
        // 중복확인 실패 시 닉네임 입력창 초기화
        form.setValue('nickname', '');
      }
    }
  }, [checkNickname, form]);

  // 회원가입 버튼 활성화 조건 (UserRole 체크 제거 - 이미 리다이렉트로 처리)
  const isSubmitDisabled =
    isLoading ||
    !isEmailVerified ||
    !nicknameVerified ||
    !form.formState.isValid;

  return (
    <div className='flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-warm'>
      <div className='w-full max-w-md mx-auto'>
        {/* 회원가입 폼 */}
        <Card className='p-8 shadow-card border border-border/50 bg-card/80 backdrop-blur-sm animate-scale-in'>
          {/* 헤더 */}
          <div className='flex items-center justify-between mb-6'>
            <Link
              to='/user-role-selection'
              className='text-muted-foreground hover:text-foreground transition-colors'
              aria-label='사용자 타입 선택으로 돌아가기'
            >
              <ArrowLeft className='w-5 h-5' />
            </Link>
            <div className='flex items-center'>
              <Heart className='w-5 h-5 text-primary mr-2' />
              <h1 className='text-lg font-bold text-foreground'>회원가입</h1>
            </div>
            <div className='w-5' />
          </div>

          <div className='bg-orange-50 border border-orange-200 rounded-md p-3 mb-6'>
            <p className='text-sm text-orange-800'>
              개인정보 보호: 입력하신 정보는 안전하게 암호화되어 저장됩니다.
            </p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {/* 이름 */}
            <div className='space-y-2'>
              <Label htmlFor='name' className='text-foreground font-medium'>
                이름
              </Label>
              <div className='relative'>
                <User className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
                <Input
                  {...form.register('name')}
                  placeholder='실명을 입력해주세요'
                  className='pl-10 bg-background/50 border-border focus:border-primary'
                  aria-describedby={
                    form.formState.errors.name ? 'name-error' : undefined
                  }
                />
              </div>
              {form.formState.errors.name && (
                <p id='name-error' className='text-destructive text-sm'>
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* 소속 */}
            <div className='space-y-2'>
              <Label
                htmlFor='organization'
                className='text-foreground font-medium'
              >
                소속
              </Label>
              <div className='relative'>
                <Building2 className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
                <Input
                  {...form.register('organization')}
                  placeholder='학교명 또는 기관명'
                  className='pl-10 bg-background/50 border-border focus:border-primary'
                  aria-describedby={
                    form.formState.errors.organization
                      ? 'organization-error'
                      : undefined
                  }
                />
              </div>
              {form.formState.errors.organization && (
                <p id='organization-error' className='text-destructive text-sm'>
                  {form.formState.errors.organization.message}
                </p>
              )}
            </div>

            {/* 생년월일 */}
            <div className='space-y-2'>
              <Label
                htmlFor='birthDate'
                className='text-foreground font-medium'
              >
                생년월일
              </Label>
              <div className='flex space-x-2'>
                <div className='relative flex-1'>
                  {/* 날짜 선택 버튼 */}
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      const input = document.getElementById(
                        'birthDate'
                      ) as HTMLInputElement;
                      if (input) {
                        try {
                          input.showPicker?.();
                        } catch {
                          input.click();
                        }
                      }
                    }}
                    className='absolute left-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent z-10'
                    aria-label='날짜 선택'
                  >
                    <Calendar className='w-4 h-4 text-muted-foreground' />
                  </Button>

                  <Input
                    id='birthDate'
                    type='date'
                    placeholder='생년월일'
                    min='1900-01-01'
                    max={`${currentYear}-${currentMonth}-${currentDay}`}
                    className='pl-10 pr-10 bg-background/50 border-border focus:border-primary [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden'
                    {...form.register('birthDate')}
                    onChange={e => {
                      const value = e.target.value;
                      form.setValue('birthDate', value);

                      // 실시간 유효성 검사
                      const error = validateBirthDate(value);
                      console.log('BirthDate validation:', {
                        value,
                        error,
                        currentDate,
                      });
                      if (typeof error === 'string') {
                        form.setError('birthDate', { message: error });
                      } else {
                        form.clearErrors('birthDate');
                      }
                    }}
                    aria-describedby={
                      form.formState.errors.birthDate
                        ? 'birthDate-error'
                        : undefined
                    }
                  />
                </div>
              </div>
              {form.formState.errors.birthDate && (
                <p id='birthDate-error' className='text-destructive text-sm'>
                  {form.formState.errors.birthDate.message}
                </p>
              )}
            </div>

            {/* 이메일 */}
            <div className='space-y-2'>
              <Label htmlFor='email' className='text-foreground font-medium'>
                이메일
              </Label>
              <div className='flex space-x-2'>
                <div className='relative flex-1'>
                  <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
                  <Input
                    {...form.register('email')}
                    type='email'
                    placeholder='example@email.com'
                    className='pl-10 bg-background/50 border-border focus:border-primary'
                    aria-describedby={
                      form.formState.errors.email ? 'email-error' : undefined
                    }
                  />
                </div>
                <Button
                  type='button'
                  onClick={() => sendEmailVerification(form.getValues('email'))}
                  disabled={emailLoading || isEmailVerified}
                  className='bg-primary hover:bg-primary-dark text-primary-foreground px-4 py-2 text-sm'
                >
                  {emailLoading ? (
                    <Loader2 className='w-4 h-4 animate-spin' />
                  ) : isEmailVerified ? (
                    '인증완료'
                  ) : isEmailSent ? (
                    '재전송'
                  ) : (
                    '인증번호 발송'
                  )}
                </Button>
              </div>
              {form.formState.errors.email && (
                <p id='email-error' className='text-destructive text-sm'>
                  {form.formState.errors.email.message}
                </p>
              )}
              {emailError && (
                <p className='text-destructive text-sm'>{emailError}</p>
              )}
              {emailSuccessMessage && (
                <p className='text-green-600 text-sm'>{emailSuccessMessage}</p>
              )}
            </div>

            {/* 이메일 인증 코드 */}
            {isEmailSent && (
              <div className='space-y-2'>
                <div className='flex space-x-2'>
                  <Input
                    {...form.register('emailVerificationCode')}
                    placeholder='인증 코드 6자리 입력'
                    className='flex-1 bg-background/50 border-border focus:border-primary'
                  />
                  <Button
                    type='button'
                    onClick={handleEmailVerification}
                    disabled={emailLoading || isEmailVerified}
                    className='bg-primary hover:bg-primary-dark text-primary-foreground px-4 py-2 text-sm'
                  >
                    {emailLoading ? (
                      <Loader2 className='w-4 h-4 animate-spin' />
                    ) : isEmailVerified ? (
                      '인증완료'
                    ) : (
                      '인증하기'
                    )}
                  </Button>
                </div>
                <p className='text-muted-foreground text-xs'>
                  * 입력하신 이메일로 인증번호가 발송됩니다.
                </p>
              </div>
            )}

            {/* 휴대폰 */}
            <div className='space-y-2'>
              <Label htmlFor='phone' className='text-foreground font-medium'>
                휴대폰
              </Label>
              <div className='relative'>
                <Phone className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
                <Input
                  {...form.register('phone')}
                  placeholder='010-1234-5678'
                  className='pl-10 bg-background/50 border-border focus:border-primary'
                  aria-describedby={
                    form.formState.errors.phone ? 'phone-error' : undefined
                  }
                />
              </div>
              {form.formState.errors.phone && (
                <p id='phone-error' className='text-destructive text-sm'>
                  {form.formState.errors.phone.message}
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
                  placeholder='8-15자리 비밀번호'
                  className='pl-10 pr-10 bg-background/50 border-border focus:border-primary'
                  aria-describedby={
                    form.formState.errors.password
                      ? 'password-error'
                      : undefined
                  }
                />
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent'
                >
                  {showPassword ? (
                    <EyeOff className='w-4 h-4 text-muted-foreground' />
                  ) : (
                    <Eye className='w-4 h-4 text-muted-foreground' />
                  )}
                </Button>
              </div>
              <div className='text-xs text-muted-foreground space-y-1'>
                <p>비밀번호 조건:</p>
                <ul className='list-disc list-inside space-y-1'>
                  <li>8-15자리</li>
                  <li>영문, 숫자, 특수문자 포함</li>
                </ul>
              </div>
              {form.formState.errors.password && (
                <p id='password-error' className='text-destructive text-sm'>
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {/* 비밀번호 확인 */}
            <div className='space-y-2'>
              <Label
                htmlFor='confirmPassword'
                className='text-foreground font-medium'
              >
                비밀번호 확인
              </Label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
                <Input
                  {...form.register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder='비밀번호 재입력'
                  className='pl-10 pr-10 bg-background/50 border-border focus:border-primary'
                  aria-describedby={
                    form.formState.errors.confirmPassword
                      ? 'confirmPassword-error'
                      : undefined
                  }
                />
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent'
                >
                  {showConfirmPassword ? (
                    <EyeOff className='w-4 h-4 text-muted-foreground' />
                  ) : (
                    <Eye className='w-4 h-4 text-muted-foreground' />
                  )}
                </Button>
              </div>
              {form.formState.errors.confirmPassword && (
                <p
                  id='confirmPassword-error'
                  className='text-destructive text-sm'
                >
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* 성별 */}
            <div className='space-y-2'>
              <Label htmlFor='gender' className='text-foreground font-medium'>
                성별
              </Label>
              <Select onValueChange={value => form.setValue('gender', value)}>
                <SelectTrigger
                  className={`w-full ${!form.watch('gender') ? 'text-red-500 border-red-500' : ''}`}
                  aria-describedby={
                    form.formState.errors.gender ? 'gender-error' : undefined
                  }
                >
                  <SelectValue placeholder='선택해주세요' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='male'>남성</SelectItem>
                  <SelectItem value='female'>여성</SelectItem>
                  <SelectItem value='other'>기타</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.gender && (
                <p id='gender-error' className='text-destructive text-sm'>
                  {form.formState.errors.gender.message}
                </p>
              )}
            </div>

            {/* 닉네임 */}
            <div className='space-y-2'>
              <Label htmlFor='nickname' className='text-foreground font-medium'>
                닉네임
              </Label>
              <div className='flex space-x-2'>
                <div className='relative flex-1'>
                  <User className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
                  <Input
                    {...form.register('nickname')}
                    placeholder='닉네임을 입력해주세요'
                    className='pl-10 bg-background/50 border-border focus:border-primary'
                    aria-describedby={
                      form.formState.errors.nickname
                        ? 'nickname-error'
                        : undefined
                    }
                  />
                </div>
                <Button
                  type='button'
                  onClick={handleNicknameCheck}
                  disabled={nicknameLoading}
                  className='bg-primary hover:bg-primary-dark text-primary-foreground px-4 py-2 text-sm'
                >
                  {nicknameLoading ? (
                    <Loader2 className='w-4 h-4 animate-spin' />
                  ) : (
                    '중복확인'
                  )}
                </Button>
              </div>
              {form.formState.errors.nickname && (
                <p id='nickname-error' className='text-destructive text-sm'>
                  {form.formState.errors.nickname.message}
                </p>
              )}
              {nicknameError && (
                <p className='text-destructive text-sm'>{nicknameError}</p>
              )}
              {nicknameSuccessMessage && (
                <p className='text-green-600 text-sm'>
                  {nicknameSuccessMessage}
                </p>
              )}
            </div>

            {/* 회원가입 버튼 */}
            <Button
              type='submit'
              disabled={isSubmitDisabled}
              className='w-full bg-primary hover:bg-primary-dark text-primary-foreground py-3 rounded-full shadow-soft font-medium text-lg'
            >
              {isLoading ? (
                <div className='flex items-center space-x-2'>
                  <Loader2 className='w-5 h-5 animate-spin' />
                  <span>가입 중...</span>
                </div>
              ) : (
                '회원가입'
              )}
            </Button>
          </form>
        </Card>
      </div>

      {/* 회원가입 결과 모달 */}
      <RegisterResultDialog
        isOpen={showRegisterResultModal}
        onClose={handleRegisterResultClose}
        isSuccess={registerResult.isSuccess}
        onLoginClick={handleLoginClick}
      />
    </div>
  );
};
