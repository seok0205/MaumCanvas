// 1. 내장 라이브러리
import { useCallback, useEffect, useMemo, useState } from 'react';

// 2. 외부 라이브러리
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, CheckCircle, Loader2, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

// 3. 내부 모듈
import {
  BirthDateField,
  GenderField,
  NameField,
  NicknameField,
  PhoneField,
} from '@/components/forms/RegisterFormFields';
import { ApiButton } from '@/components/ui/ApiButton';
import { FormLayout } from '@/components/ui/forms/FormLayout';
import { Input } from '@/components/ui/forms/input';
import { PasswordInput } from '@/components/ui/forms/PasswordInput';
import { PrivacyNotice } from '@/components/ui/forms/PrivacyNotice';
import { Button } from '@/components/ui/interactive/button';
import {
  AuthenticationFailureDialog,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/overlay/dialog';
import { Label } from '@/components/ui/primitives/label';
import { FORM_CONSTANTS, FORM_MESSAGES } from '@/constants/forms';
import { useAuthActions } from '@/hooks/useAuthActions';
import { useEmailVerification } from '@/hooks/useEmailVerification';
import { useNicknameCheck } from '@/hooks/useNicknameCheck';
import { useSubmitButton } from '@/hooks/useSubmitButton';
import { useAuthStore } from '@/stores/useAuthStore';
import type { School } from '@/types/school';
import { roleToRolesArray } from '@/utils/userRoleMapping';
import { SchoolSearchInput } from './SchoolSearchInput';

const registerSchema = z
  .object({
    name: z
      .string()
      .min(FORM_CONSTANTS.VALIDATION.NAME_MIN_LENGTH, {
        message: FORM_MESSAGES.VALIDATION.NAME_MIN,
      })
      .regex(FORM_CONSTANTS.VALIDATION.KOREAN_PATTERN, {
        message: FORM_MESSAGES.VALIDATION.NAME_KOREAN_ONLY,
      }),
    birthDate: z.string().min(1, {
      message: FORM_MESSAGES.VALIDATION.BIRTH_DATE_REQUIRED,
    }),
    email: z.email({
      message: FORM_MESSAGES.VALIDATION.EMAIL_INVALID,
    }),
    emailVerificationCode: z.string().optional(),
    phone: z
      .string()
      .min(FORM_CONSTANTS.VALIDATION.PHONE_MIN_LENGTH, {
        message: FORM_MESSAGES.VALIDATION.PHONE_MIN,
      })
      .max(FORM_CONSTANTS.VALIDATION.PHONE_MAX_LENGTH, {
        message: FORM_MESSAGES.VALIDATION.PHONE_MAX,
      })
      .refine(
        value => {
          // 하이픈 제거 후 패턴 검증
          const cleaned = value.replace(/-/g, '');
          return FORM_CONSTANTS.VALIDATION.PHONE_NUMBER_ONLY_PATTERN.test(
            cleaned
          );
        },
        {
          message: FORM_MESSAGES.VALIDATION.PHONE_PATTERN,
        }
      ),
    password: z
      .string()
      .min(FORM_CONSTANTS.PASSWORD.MIN_LENGTH, {
        message: FORM_MESSAGES.VALIDATION.PASSWORD_MIN,
      })
      .max(FORM_CONSTANTS.PASSWORD.MAX_LENGTH, {
        message: FORM_MESSAGES.VALIDATION.PASSWORD_MAX,
      })
      .regex(FORM_CONSTANTS.PASSWORD.PATTERN, {
        message: FORM_MESSAGES.VALIDATION.PASSWORD_PATTERN,
      }),
    confirmPassword: z.string(),
    gender: z.string().min(1, {
      message: FORM_MESSAGES.VALIDATION.GENDER_REQUIRED,
    }),
    nickname: z
      .string()
      .min(FORM_CONSTANTS.VALIDATION.NICKNAME_MIN_LENGTH, {
        message: FORM_MESSAGES.VALIDATION.NICKNAME_MIN,
      })
      .max(FORM_CONSTANTS.VALIDATION.NICKNAME_MAX_LENGTH, {
        message: FORM_MESSAGES.VALIDATION.NICKNAME_MAX,
      })
      .regex(FORM_CONSTANTS.VALIDATION.NICKNAME_PATTERN, {
        message: FORM_MESSAGES.VALIDATION.NICKNAME_PATTERN,
      }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: FORM_MESSAGES.VALIDATION.PASSWORD_MISMATCH,
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
  // 자동 리다이렉트를 위한 타이머
  useEffect(() => {
    if (isOpen && isSuccess) {
      const timer = setTimeout(() => {
        onLoginClick?.();
      }, 1000); // 1초 후 자동 리다이렉트

      return () => clearTimeout(timer);
    }
    return undefined; // 명시적으로 undefined 반환
  }, [isOpen, isSuccess, onLoginClick]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className='sm:max-w-md'
        onPointerDownOutside={e => e.preventDefault()}
      >
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
              ? '마음 캔버스에 오신 것을 환영합니다! 잠시 후 로그인 페이지로 이동합니다.'
              : '회원가입에 실패했습니다. 다시 시도해주세요.'}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className='flex flex-col sm:flex-row gap-2'>
          {isSuccess ? (
            <div className='w-full text-center'>
              <p className='text-sm text-muted-foreground mb-2'>
                자동으로 로그인 페이지로 이동합니다...
              </p>
              <Button onClick={onLoginClick} className='w-full sm:w-auto'>
                바로 로그인하기
              </Button>
            </div>
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
  // ...existing code...

  // 디버깅용: 주요 상태 콘솔 출력 (return문 바로 위에서 실행)

  // ...existing code...
  const [showRegisterResultModal, setShowRegisterResultModal] = useState(false);
  const [registerResult, setRegisterResult] = useState<{
    isSuccess: boolean;
  }>({ isSuccess: false });
  const [nicknameVerified, setNicknameVerified] = useState(false);
  const [verifiedNickname, setVerifiedNickname] = useState<string>(''); // 중복 체크 완료된 닉네임 저장
  const [showAuthFailureModal, setShowAuthFailureModal] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [schoolSearchValue, setSchoolSearchValue] = useState('');

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
    verificationAttempts,
    isBlocked: isEmailBlocked,
  } = useEmailVerification();
  const {
    checkNickname,
    error: nicknameError,
    successMessage: nicknameSuccessMessage,
    isLoading: nicknameLoading,
  } = useNicknameCheck();

  // 현재 날짜 정보 (컴포넌트 마운트 시점 고정)
  const currentDate = useMemo(() => new Date(), []);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
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
      if (!value) return FORM_MESSAGES.VALIDATION.BIRTH_DATE_REQUIRED;

      const inputDate = new Date(value);

      // 유효한 날짜인지 검사
      if (isNaN(inputDate.getTime())) {
        return FORM_MESSAGES.VALIDATION.BIRTH_DATE_INVALID;
      }

      // 미래 날짜 검사
      if (inputDate > currentDate) {
        return FORM_MESSAGES.VALIDATION.BIRTH_DATE_INVALID;
      }

      // 최소 나이 검사 (1900년 이전)
      if (inputDate.getFullYear() < FORM_CONSTANTS.BIRTH_DATE.MIN_YEAR) {
        return FORM_MESSAGES.VALIDATION.BIRTH_DATE_INVALID;
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

  // 인증 차단 상태 감지
  useEffect(() => {
    if (isEmailBlocked) {
      setShowAuthFailureModal(true);
    }
  }, [isEmailBlocked]);

  // 닉네임 변경 시 중복 체크 상태 리셋
  useEffect(() => {
    const subscription = form.watch((_value, { name }) => {
      if (name === 'nickname') {
        setNicknameVerified(false);
        setVerifiedNickname(''); // 닉네임 변경 시 중복 체크 완료된 닉네임 초기화
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // 사용자 역할이 선택되지 않은 경우 UserRoleSelection 페이지로 리다이렉트
  useEffect(() => {
    if (!selectedUserRole) {
      navigate('/user-role-selection', { replace: true });
    }
  }, [selectedUserRole, navigate]);

  const { handleSubmit, isLoading } = useSubmitButton({
    mutationFn: async (data: RegisterFormData) => {
      if (!selectedUserRole) {
        throw new Error('사용자 역할이 선택되지 않았습니다.');
      }

      if (!selectedSchool) {
        throw new Error('학교를 선택해주세요.');
      }

      const success = await register({
        name: data.name,
        email: data.email,
        password: data.password,
        nickname: data.nickname,
        gender: data.gender.toUpperCase() as 'MALE' | 'FEMALE' | 'OTHERS',
        phone: data.phone,
        school: {
          name: selectedSchool.name,
        },
        birthday: data.birthDate,
        roles: roleToRolesArray(selectedUserRole),
      });

      if (!success) {
        throw new Error('회원가입에 실패했습니다.');
      }

      return success;
    },
    onSuccess: () => {
      setRegisterResult({ isSuccess: true });
      setShowRegisterResultModal(true);
    },
    onError: () => {
      setRegisterResult({ isSuccess: false });
      setShowRegisterResultModal(true);
      // 에러 메시지는 모달에서 처리
    },
  });

  const onSubmit = useCallback(
    async (data: RegisterFormData) => {
      await handleSubmit(data);
    },
    [handleSubmit]
  );

  const handleRegisterResultClose = useCallback(() => {
    setShowRegisterResultModal(false);
    if (!registerResult.isSuccess) {
      navigate('/user-role-selection');
    }
  }, [registerResult.isSuccess, navigate]);

  const handleLoginClick = useCallback(() => {
    setShowRegisterResultModal(false);
    navigate('/login');
  }, [navigate]);

  const handleAuthFailureRetry = useCallback(() => {
    setShowAuthFailureModal(false);
    resetEmailState();
    navigate('/user-role-selection');
  }, [resetEmailState, navigate]);

  const handleAuthFailureClose = useCallback(() => {
    setShowAuthFailureModal(false);
    navigate('/user-role-selection');
  }, [navigate]);

  // 이메일 인증 성공 처리
  const handleEmailVerification = useCallback(async () => {
    const email = form.getValues('email');
    const code = form.getValues('emailVerificationCode') || '';

    const abortController = new AbortController();

    try {
      await verifyEmail(email, code, abortController.signal);
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        // 에러는 useEmailVerification 훅에서 처리됨
      }
    }
  }, [verifyEmail, form]);

  // 닉네임 중복 체크 성공 처리
  const handleNicknameCheck = useCallback(async () => {
    const nickname = form.getValues('nickname');

    const abortController = new AbortController();

    try {
      // checkNickname이 true를 반환할 때만 성공으로 처리
      const isSuccess = await checkNickname(nickname, abortController.signal);

      if (isSuccess) {
        setNicknameVerified(true); // 200 코드를 받았을 때만 true로 설정
        setVerifiedNickname(nickname); // 중복 체크 완료된 닉네임 저장
      } else {
        setNicknameVerified(false); // 실패 시 false로 설정
        setVerifiedNickname(''); // 닉네임 필드 초기화
      }
    } catch (error) {
      // 예상치 못한 에러 처리
      if (error instanceof Error && error.name !== 'AbortError') {
        setNicknameVerified(false);
        setVerifiedNickname('');
      }
    }
  }, [checkNickname, form]);

  // 회원가입 버튼 활성화 조건
  const isSubmitDisabled = useMemo(() => {
    const isValid = form.formState.isValid;
    const formNickname = form.watch('nickname');
    const nicknameMatch = formNickname === verifiedNickname;
    const nicknameCondition = formNickname !== '' ? nicknameMatch : true;

    const result =
      isLoading ||
      !isValid ||
      !isEmailVerified ||
      !nicknameVerified ||
      !selectedSchool ||
      !nicknameCondition;

    console.group('🔒 [RegisterForm] 버튼 활성화 조건 체크');
    console.log('⏳ isLoading:', isLoading);
    console.log('📝 isFormValid:', isValid);
    console.log('📧 isEmailVerified:', isEmailVerified);
    console.log('👤 nicknameVerified:', nicknameVerified);
    console.log('🏫 hasSelectedSchool:', !!selectedSchool);
    console.log('🏷️ nicknameMatch:', nicknameCondition);
    console.log('🚨 finalResult (disabled):', result);
    console.groupEnd();

    return result;
  }, [
    form.formState.isValid,
    isLoading,
    isEmailVerified,
    nicknameVerified,
    selectedSchool,
    form.watch('nickname'),
    verifiedNickname,
  ]);

  // 디버깅용: 주요 상태 콘솔 출력 (렌더마다)
  useEffect(() => {
    console.group('🔍 [RegisterForm] 디버깅 정보');
    console.log('📋 formState:', {
      defaultValues: form.formState.defaultValues,
      isDirty: form.formState.isDirty,
      isValid: form.formState.isValid,
      errors: form.formState.errors,
    });
    console.log('📧 isEmailVerified:', isEmailVerified);
    console.log('👤 nicknameVerified:', nicknameVerified);
    console.log('🏫 selectedSchool:', selectedSchool);
    console.log('✅ verifiedNickname:', verifiedNickname);
    console.log('🏷️ 현재 닉네임:', form?.watch('nickname'));

    // 모든 필드 값 디버깅
    const allValues = form.getValues();
    console.log('📝 모든 필드 값:', allValues);
    console.groupEnd();
  }, [
    form,
    isEmailVerified,
    nicknameVerified,
    selectedSchool,
    verifiedNickname,
  ]);

  // 컴포넌트 마운트 시 한 번 실행되는 로그
  useEffect(() => {
    console.log('🚀 RegisterForm 컴포넌트가 마운트되었습니다');
    return () => {
      console.log('🛑 RegisterForm 컴포넌트가 언마운트됩니다');
    };
  }, []);

  // formState가 초기화된 후 한 번만 실행하는 검증 로직
  useEffect(() => {
    // 모든 필드를 트리거하여 검증을 활성화
    const validateAllFields = async () => {
      await form.trigger();
    };

    validateAllFields();
  }, [form]);

  return (
    <FormLayout title='회원가입'>
      <PrivacyNotice className='mb-6' />

      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <NameField form={form} />

        {/* 학교 검색 */}
        <div className='space-y-2'>
          <Label htmlFor='school' className='text-foreground font-medium'>
            학교 *
          </Label>
          <SchoolSearchInput
            value={schoolSearchValue}
            onChange={setSchoolSearchValue}
            onSelect={school => {
              setSelectedSchool(school);
              setSchoolSearchValue(school.name);
            }}
            placeholder='학교명을 입력하세요'
            className='w-full'
          />
          {selectedSchool && (
            <div className='mt-1 text-sm text-green-600'>
              선택된 학교: {selectedSchool.name}
            </div>
          )}
        </div>

        <BirthDateField
          form={form}
          currentDate={currentDate}
          validateBirthDate={validateBirthDate}
        />

        {/* 이메일 */}
        <div className='space-y-2'>
          <Label htmlFor='email' className='text-foreground font-medium'>
            이메일
          </Label>
          <div className='flex space-x-2'>
            <div className='relative flex-1'>
              <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none' />
              <Input
                id='email'
                type='email'
                placeholder='이메일을 입력하세요'
                className='pl-10'
                {...form.register('email')}
              />
            </div>
            <Button
              type='button'
              onClick={() => sendEmailVerification(form.getValues('email'))}
              disabled={
                !form.watch('email') ||
                emailLoading ||
                isEmailBlocked ||
                isEmailVerified
              }
              variant='outline'
              size='sm'
              className='whitespace-nowrap'
            >
              {emailLoading ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : isEmailSent ? (
                '재발송'
              ) : (
                '인증번호 발송'
              )}
            </Button>
          </div>
          {form.formState.errors.email && (
            <p className='text-destructive text-sm'>
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
        {isEmailSent && !isEmailVerified && (
          <div className='space-y-2'>
            <Label
              htmlFor='emailVerificationCode'
              className='text-foreground font-medium'
            >
              인증번호
            </Label>
            <div className='flex space-x-2'>
              <Input
                id='emailVerificationCode'
                type='text'
                placeholder='인증번호 6자리를 입력하세요'
                maxLength={6}
                className='flex-1'
                {...form.register('emailVerificationCode')}
              />
              {form.formState.errors.emailVerificationCode && (
                <p className='text-destructive text-sm'>
                  {form.formState.errors.emailVerificationCode.message}
                </p>
              )}
              <Button
                type='button'
                onClick={handleEmailVerification}
                disabled={
                  !form.watch('emailVerificationCode') ||
                  emailLoading ||
                  isEmailBlocked
                }
                variant='outline'
                size='sm'
                className='whitespace-nowrap'
              >
                {emailLoading ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  '인증 확인'
                )}
              </Button>
            </div>
            <div
              id='verification-code-help'
              className='text-muted-foreground text-xs'
            >
              * 입력하신 이메일로 인증번호가 발송됩니다.
              {verificationAttempts > 0 && (
                <span className='text-orange-600 ml-2' role='alert'>
                  남은 시도:{' '}
                  {FORM_CONSTANTS.EMAIL.VERIFICATION_ATTEMPTS -
                    verificationAttempts}
                  회
                </span>
              )}
            </div>
            <div
              id='verification-status'
              aria-live='polite'
              className='sr-only'
            >
              {isEmailBlocked &&
                '인증이 차단되었습니다. 페이지를 새로고침 후 다시 시도해주세요.'}
            </div>
          </div>
        )}

        {/* 이메일 인증 성공 상태 표시 */}
        {isEmailSent && isEmailVerified && (
          <div className='space-y-2'>
            <div className='flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg'>
              <CheckCircle className='w-5 h-5 text-green-600 flex-shrink-0' />
              <div className='flex-1'>
                <p className='text-green-800 text-sm font-medium'>
                  이메일 인증이 완료되었습니다
                </p>
              </div>
            </div>
            <div
              id='verification-success-status'
              aria-live='polite'
              className='sr-only'
            >
              이메일 인증이 완료되었습니다. 인증된 이메일: {form.watch('email')}
            </div>
          </div>
        )}

        <PhoneField form={form} />

        {/* 비밀번호 */}
        <PasswordInput
          label='비밀번호'
          {...form.register('password')}
          error={form.formState.errors.password?.message || undefined}
        />
        <div className='text-xs text-muted-foreground space-y-1'>
          <p>비밀번호 조건:</p>
          <ul className='list-disc list-inside space-y-1'>
            <li>8-15자리</li>
            <li>영문, 숫자, 특수문자 포함</li>
          </ul>
        </div>

        {/* 비밀번호 확인 */}
        <PasswordInput
          label='비밀번호 확인'
          {...form.register('confirmPassword')}
          error={form.formState.errors.confirmPassword?.message || undefined}
        />

        <GenderField form={form} />

        {/* 닉네임 */}
        <div className='space-y-2'>
          <NicknameField
            form={form}
            onCheckNickname={handleNicknameCheck}
            isLoading={nicknameLoading}
            isVerified={
              nicknameVerified && form.watch('nickname') === verifiedNickname
            }
          />
          {nicknameError && (
            <p className='text-destructive text-sm'>{nicknameError}</p>
          )}
          {nicknameSuccessMessage && (
            <p className='text-green-600 text-sm'>{nicknameSuccessMessage}</p>
          )}
        </div>

        {/* 회원가입 버튼 */}
        <ApiButton
          type='submit'
          isLoading={isLoading}
          loadingText='회원가입 중...'
          disabled={isSubmitDisabled}
          onClick={() => {}} // 폼 제출은 onSubmit에서 처리되므로 빈 함수
          className='w-full bg-primary hover:bg-primary-dark text-primary-foreground py-3 rounded-full shadow-soft font-medium text-lg'
        >
          회원가입
          {isSubmitDisabled && (
            <span className='ml-2 text-xs'>(양식을 완성해주세요)</span>
          )}
        </ApiButton>
      </form>

      {/* 회원가입 결과 모달 */}
      <RegisterResultDialog
        isOpen={showRegisterResultModal}
        onClose={handleRegisterResultClose}
        isSuccess={registerResult.isSuccess}
        onLoginClick={handleLoginClick}
      />

      {/* 인증 실패 모달 */}
      <AuthenticationFailureDialog
        isOpen={showAuthFailureModal}
        onClose={handleAuthFailureClose}
        onRetry={handleAuthFailureRetry}
      />
    </FormLayout>
  );
};
