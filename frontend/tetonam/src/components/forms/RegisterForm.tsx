// 내장 라이브러리
import { useCallback, useState } from 'react';

// 외부 라이브러리
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Eye,
  EyeOff,
  Heart,
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
import { Label } from '@/components/ui/primitives/label';
import { useToast } from '@/hooks/use-toast';
import { useAuthActions } from '@/hooks/useAuthActions';
import { useEmailVerification } from '@/hooks/useEmailVerification';
import { useNicknameCheck } from '@/hooks/useNicknameCheck';
import { useAuthStore } from '@/stores/useAuthStore';

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
      .regex(
        /^(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])/,
        { message: '영문, 숫자, 특수문자를 포함해야 합니다' }
      ),
    confirmPassword: z.string(),
    gender: z.string().min(1, { message: '성별을 선택해주세요' }),
    nickname: z.string().min(2, { message: '닉네임은 2자 이상 입력해주세요' }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuthActions();
  const { selectedUserType } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isEmailSent, sendEmailVerification, verifyEmail } =
    useEmailVerification();
  const { checkNickname } = useNicknameCheck();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      organization: '',
      birthDate: '',
      email: '',
      emailVerificationCode: '',
      phone: '',
      password: '',
      confirmPassword: '',
      gender: '',
      nickname: '',
    },
  });

  const onSubmit = useCallback(
    async (data: RegisterFormData) => {
      if (!selectedUserType) {
        toast({
          title: '사용자 타입을 선택해주세요',
          description: '사용자 타입 선택 페이지로 이동합니다.',
          variant: 'destructive',
        });
        navigate('/user-type-selection');
        return;
      }

      setIsLoading(true);
      try {
        const success = await register({
          name: data.name,
          email: data.email,
          userType: selectedUserType,
        });

        if (success) {
          toast({
            title: '회원가입 성공',
            description: '마음 캔버스에 오신 것을 환영합니다!',
          });
          navigate('/dashboard');
        } else {
          toast({
            title: '회원가입 실패',
            description: '다시 시도해주세요.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        toast({
          title: '오류 발생',
          description: '회원가입 중 문제가 발생했습니다.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [selectedUserType, register, navigate, toast]
  );

  return (
    <div className='min-h-screen bg-gradient-warm flex flex-col items-center justify-center p-6'>
      <div className='w-full max-w-md mx-auto'>
        {/* 회원가입 폼 */}
        <Card className='p-6 shadow-card border border-border/50 bg-card/80 backdrop-blur-sm'>
          {/* 헤더 */}
          <div className='flex items-center justify-between mb-6'>
            <Link
              to='/user-type-selection'
              className='text-muted-foreground hover:text-foreground transition-colors'
            >
              <ArrowLeft className='w-5 h-5' />
            </Link>
            <div className='flex items-center'>
              <Heart className='w-5 h-5 text-primary mr-2' />
              <h1 className='text-lg font-bold text-foreground'>회원가입</h1>
            </div>
            <div className='w-5' /> {/* Spacer for center alignment */}
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {/* 기본 정보 섹션 */}
            <div className='space-y-4'>
              <div className='border-b border-primary pb-1'>
                <h2 className='text-base font-bold text-foreground'>
                  기본 정보
                </h2>
              </div>

              {/* 개인정보 보호 안내 */}
              <div className='bg-orange-50 border border-orange-200 rounded-md p-3'>
                <p className='text-sm text-orange-800'>
                  개인정보 보호: 입력하신 정보는 안전하게 암호화되어 저장됩니다.
                </p>
              </div>

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
                    className='pl-10 border-border bg-background/50 focus:border-primary'
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
                    className='pl-10 border-border bg-background/50 focus:border-primary'
                    aria-describedby={
                      form.formState.errors.organization
                        ? 'organization-error'
                        : undefined
                    }
                  />
                </div>
                {form.formState.errors.organization && (
                  <p
                    id='organization-error'
                    className='text-destructive text-sm'
                  >
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
                  생년월일 (나이 인증용)
                </Label>
                <div className='relative'>
                  <Calendar className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
                  <Input
                    {...form.register('birthDate')}
                    type='date'
                    placeholder='mm/dd/yyyy'
                    className='pl-10 border-border bg-background/50 focus:border-primary'
                    aria-describedby={
                      form.formState.errors.birthDate
                        ? 'birthDate-error'
                        : undefined
                    }
                  />
                </div>
                {form.formState.errors.birthDate && (
                  <p id='birthDate-error' className='text-destructive text-sm'>
                    {form.formState.errors.birthDate.message}
                  </p>
                )}
              </div>
            </div>

            {/* 연락처 정보 인증 섹션 */}
            <div className='space-y-4'>
              <div className='border-b border-primary pb-1'>
                <h2 className='text-base font-bold text-foreground'>
                  연락처 정보 인증
                </h2>
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
                      className='pl-10 border-border bg-background/50 focus:border-primary'
                      aria-describedby={
                        form.formState.errors.email ? 'email-error' : undefined
                      }
                    />
                  </div>
                  <Button
                    type='button'
                    onClick={() =>
                      sendEmailVerification(form.getValues('email'))
                    }
                    className='bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 text-sm'
                  >
                    인증번호 발송
                  </Button>
                </div>
                {form.formState.errors.email && (
                  <p id='email-error' className='text-destructive text-sm'>
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* 이메일 인증 코드 */}
              {isEmailSent && (
                <div className='space-y-2'>
                  <div className='flex space-x-2'>
                    <Input
                      {...form.register('emailVerificationCode')}
                      placeholder='인증 코드 6자리 입력'
                      className='flex-1 border-border bg-background/50 focus:border-primary'
                    />
                    <Button
                      type='button'
                      onClick={() =>
                        verifyEmail(
                          form.getValues('email'),
                          form.getValues('emailVerificationCode') || ''
                        )
                      }
                      className='bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 text-sm'
                    >
                      인증하기
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
                    className='pl-10 border-border bg-background/50 focus:border-primary'
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
            </div>

            {/* 계정 설정 섹션 */}
            <div className='space-y-4'>
              <div className='border-b border-primary pb-1'>
                <h2 className='text-base font-bold text-foreground'>
                  계정 설정
                </h2>
              </div>

              {/* 비밀번호 */}
              <div className='space-y-2'>
                <Label
                  htmlFor='password'
                  className='text-foreground font-medium'
                >
                  비밀번호
                </Label>
                <div className='relative'>
                  <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
                  <Input
                    {...form.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder='8-15자리 비밀번호'
                    className='pl-10 pr-10 border-border bg-background/50 focus:border-primary'
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
                    className='pl-10 pr-10 border-border bg-background/50 focus:border-primary'
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
                <div className='flex items-center space-x-2'>
                  <Label
                    htmlFor='gender'
                    className='text-foreground font-medium'
                  >
                    성별
                  </Label>
                </div>
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
                <Label
                  htmlFor='nickname'
                  className='text-foreground font-medium'
                >
                  닉네임
                </Label>
                <div className='flex space-x-2'>
                  <div className='relative flex-1'>
                    <User className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
                    <Input
                      {...form.register('nickname')}
                      placeholder='닉네임을 입력해주세요'
                      className='pl-10 border-border bg-background/50 focus:border-primary'
                      aria-describedby={
                        form.formState.errors.nickname
                          ? 'nickname-error'
                          : undefined
                      }
                    />
                  </div>
                  <Button
                    type='button'
                    onClick={() => checkNickname(form.getValues('nickname'))}
                    className='bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 text-sm'
                  >
                    중복확인
                  </Button>
                </div>
                <p className='text-muted-foreground text-xs'>
                  * 다른 사용자에게 보여질 이름입니다
                </p>
                {form.formState.errors.nickname && (
                  <p id='nickname-error' className='text-destructive text-sm'>
                    {form.formState.errors.nickname.message}
                  </p>
                )}
              </div>
            </div>

            {/* 회원가입 버튼 */}
            <div className='flex justify-end pt-4'>
              <Button
                type='submit'
                disabled={isLoading}
                className='bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 font-medium'
              >
                {isLoading ? '가입 중...' : '회원가입'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
