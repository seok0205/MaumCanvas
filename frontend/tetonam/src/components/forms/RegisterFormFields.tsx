import { Building2, Calendar, Loader2, Phone, User } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

import { Input } from '@/components/ui/forms/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/forms/select';
import { Button } from '@/components/ui/interactive/button';
import { Label } from '@/components/ui/primitives/label';
import { FORM_CONSTANTS } from '@/constants/forms';
import { formatPhoneInput } from '@/utils/phoneUtils';

// Zod 스키마에서 타입 추론
const registerSchema = z
  .object({
    name: z
      .string()
      .min(FORM_CONSTANTS.VALIDATION.NAME_MIN_LENGTH)
      .regex(FORM_CONSTANTS.VALIDATION.KOREAN_PATTERN),
    organization: z
      .string()
      .min(FORM_CONSTANTS.VALIDATION.ORGANIZATION_MIN_LENGTH)
      .regex(FORM_CONSTANTS.VALIDATION.KOREAN_PATTERN),
    birthDate: z.string().min(1),
    email: z.email(),
    emailVerificationCode: z.string().optional(),
    phone: z
      .string()
      .min(FORM_CONSTANTS.VALIDATION.PHONE_MIN_LENGTH)
      .max(FORM_CONSTANTS.VALIDATION.PHONE_MAX_LENGTH)
      .refine(
        value => {
          const cleaned = value.replace(/-/g, '');
          return FORM_CONSTANTS.VALIDATION.PHONE_NUMBER_ONLY_PATTERN.test(
            cleaned
          );
        },
        {
          message: '올바른 휴대폰 번호를 입력해주세요',
        }
      ),
    password: z.string(),
    confirmPassword: z.string(),
    gender: z.string().min(1),
    nickname: z
      .string()
      .min(FORM_CONSTANTS.VALIDATION.NICKNAME_MIN_LENGTH)
      .max(FORM_CONSTANTS.VALIDATION.NICKNAME_MAX_LENGTH)
      .regex(FORM_CONSTANTS.VALIDATION.NICKNAME_PATTERN),
  })
  .refine(data => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormFieldsProps {
  form: UseFormReturn<RegisterFormData>;
  currentDate: Date;
  validateBirthDate: (value: string) => string | true;
}

export const NameField = ({
  form,
}: {
  form: UseFormReturn<RegisterFormData>;
}) => (
  <div className='space-y-2'>
    <Label htmlFor='name' className='text-foreground font-medium'>
      이름
    </Label>
    <div className='relative'>
      <User className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
      <Input
        {...form.register('name')}
        placeholder='실명을 입력해주세요 (한글만)'
        className='pl-10 bg-background/50 border-border focus:border-primary'
        pattern='[가-힣]+'
        aria-describedby={
          form.formState.errors['name'] ? 'name-error' : undefined
        }
      />
    </div>
    {form.formState.errors['name'] && (
      <p id='name-error' className='text-destructive text-sm'>
        {form.formState.errors['name']?.message}
      </p>
    )}
  </div>
);

export const OrganizationField = ({
  form,
}: {
  form: UseFormReturn<RegisterFormData>;
}) => (
  <div className='space-y-2'>
    <Label htmlFor='organization' className='text-foreground font-medium'>
      소속
    </Label>
    <div className='relative'>
      <Building2 className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
      <Input
        {...form.register('organization')}
        placeholder='학교명 또는 기관명 (한글만, 5자 이상)'
        className='pl-10 bg-background/50 border-border focus:border-primary'
        pattern='[가-힣]+'
        aria-describedby={
          form.formState.errors['organization']
            ? 'organization-error'
            : undefined
        }
      />
    </div>
    {form.formState.errors['organization'] && (
      <p id='organization-error' className='text-destructive text-sm'>
        {form.formState.errors['organization']?.message}
      </p>
    )}
  </div>
);

export const BirthDateField = ({
  form,
  currentDate,
  validateBirthDate,
}: RegisterFormFieldsProps) => {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentDay = currentDate.getDate();

  return (
    <div className='space-y-2'>
      <Label htmlFor='birthDate' className='text-foreground font-medium'>
        생년월일
      </Label>
      <div className='flex space-x-2'>
        <div className='relative flex-1'>
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
            min={`${FORM_CONSTANTS.BIRTH_DATE.MIN_YEAR}-01-01`}
            max={`${currentYear}-${currentMonth}-${currentDay}`}
            className='pl-10 pr-10 bg-background/50 border-border focus:border-primary [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden [&::-webkit-outer-spin-button]:hidden'
            {...form.register('birthDate')}
            onChange={e => {
              const value = e.target.value;
              form.setValue('birthDate', value, { shouldValidate: true });

              const error = validateBirthDate(value);
              if (typeof error === 'string') {
                form.setError('birthDate', { message: error });
              } else {
                form.clearErrors('birthDate');
              }
            }}
            aria-describedby={
              form.formState.errors['birthDate'] ? 'birthDate-error' : undefined
            }
          />
        </div>
      </div>
      {form.formState.errors['birthDate'] && (
        <p id='birthDate-error' className='text-destructive text-sm'>
          {form.formState.errors['birthDate']?.message}
        </p>
      )}
    </div>
  );
};

export const PhoneField = ({
  form,
}: {
  form: UseFormReturn<RegisterFormData>;
}) => {
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhoneInput(e.target.value);
    form.setValue('phone', formattedValue, { shouldValidate: true });
  };

  return (
    <div className='space-y-2'>
      <Label htmlFor='phone' className='text-foreground font-medium'>
        휴대폰
      </Label>
      <div className='relative'>
        <Phone className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
        <Input
          {...form.register('phone')}
          id='phone'
          type='tel'
          placeholder='010-1234-5678'
          className='pl-10 bg-background/50 border-border focus:border-primary'
          onChange={handlePhoneChange}
          maxLength={13}
          aria-describedby={
            form.formState.errors['phone'] ? 'phone-error' : 'phone-help'
          }
          aria-invalid={!!form.formState.errors['phone']}
        />
      </div>
      {form.formState.errors['phone'] ? (
        <p id='phone-error' className='text-destructive text-sm' role='alert'>
          {form.formState.errors['phone']?.message}
        </p>
      ) : (
        <p id='phone-help' className='text-muted-foreground text-xs'>
          하이픈(-)은 자동으로 추가됩니다
        </p>
      )}
    </div>
  );
};

export const GenderField = ({
  form,
}: {
  form: UseFormReturn<RegisterFormData>;
}) => (
  <div className='space-y-2'>
    <Label htmlFor='gender' className='text-foreground font-medium'>
      성별
    </Label>
    <Select
      onValueChange={value =>
        form.setValue('gender', value, { shouldValidate: true })
      }
      value={form.watch('gender')}
    >
      <SelectTrigger
        className={`w-full ${!form.watch('gender') ? 'text-red-500 border-red-500' : ''}`}
        aria-describedby={
          form.formState.errors['gender'] ? 'gender-error' : undefined
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
    {form.formState.errors['gender'] && (
      <p id='gender-error' className='text-destructive text-sm'>
        {form.formState.errors['gender']?.message}
      </p>
    )}
  </div>
);

export const NicknameField = ({
  form,
  onCheckNickname,
  isLoading,
  isVerified,
}: {
  form: UseFormReturn<RegisterFormData>;
  onCheckNickname?: () => void;
  isLoading?: boolean;
  isVerified?: boolean;
}) => {
  const nickname = form.watch('nickname');
  const nicknameError = form.formState.errors.nickname;
  const isNicknameValid =
    nickname &&
    !nicknameError &&
    nickname.length >= FORM_CONSTANTS.VALIDATION.NICKNAME_MIN_LENGTH;

  return (
    <div className='space-y-2'>
      <Label htmlFor='nickname' className='text-foreground font-medium'>
        닉네임
      </Label>
      <div className='flex space-x-2'>
        <div className='relative flex-1'>
          <User className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
          <Input
            {...form.register('nickname')}
            placeholder='닉네임을 입력해주세요 (2-10자, 완성형 한글/영문/숫자)'
            className={`pl-10 bg-background/50 border-border focus:border-primary ${
              isVerified ? 'border-green-500' : ''
            }`}
            pattern='[가-힣a-zA-Z0-9]+'
            maxLength={FORM_CONSTANTS.VALIDATION.NICKNAME_MAX_LENGTH}
            aria-describedby={
              form.formState.errors['nickname'] ? 'nickname-error' : undefined
            }
          />
        </div>
        {onCheckNickname && (
          <Button
            type='button'
            onClick={onCheckNickname}
            disabled={isLoading || !isNicknameValid || isVerified}
            className={`px-4 py-2 text-sm whitespace-nowrap ${
              isVerified
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-primary hover:bg-primary-dark text-primary-foreground'
            }`}
          >
            {isLoading ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : isVerified ? (
              '확인완료'
            ) : (
              '중복확인'
            )}
          </Button>
        )}
      </div>
      {form.formState.errors['nickname'] && (
        <p id='nickname-error' className='text-destructive text-sm'>
          {form.formState.errors['nickname']?.message}
        </p>
      )}
      {isVerified && (
        <p className='text-green-600 text-sm'>✓ 사용 가능한 닉네임입니다.</p>
      )}
    </div>
  );
};
