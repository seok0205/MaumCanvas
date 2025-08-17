import { Input } from '@/components/ui/forms/input';
import { Button } from '@/components/ui/interactive/button';
import { Label } from '@/components/ui/primitives/label';
import { PASSWORD_RESET_CONSTANTS } from '@/constants/passwordReset';
import {
  verificationSchema,
  type VerificationFormData,
} from '@/types/passwordReset';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, Key, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

interface VerificationStepFormProps {
  email: string;
  onSubmit: (data: VerificationFormData) => Promise<void>;
  onResendCode: () => Promise<void>;
  isLoading: boolean;
  message?: { type: 'success' | 'error'; message: string } | null;
  // 인증 시도 제한 관련 props 추가
  verificationAttempts?: number;
  isBlocked?: boolean;
  onResetState?: () => void;
}

export const VerificationStepForm = ({
  email,
  onSubmit,
  onResendCode,
  isLoading,
  message,
  verificationAttempts = 0,
  isBlocked = false,
  onResetState,
}: VerificationStepFormProps) => {
  const form = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    mode: 'onBlur',
  });

  const handleSubmit = async (data: VerificationFormData) => {
    if (isBlocked) return; // 차단된 상태에서는 제출 방지
    await onSubmit(data);
  };

  const handleResendCode = async () => {
    if (isBlocked) return; // 차단된 상태에서는 재전송 방지
    await onResendCode();
  };

  const handleResetState = () => {
    if (onResetState) {
      // 폼 초기화
      form.reset();
      // 부모 컴포넌트의 상태 초기화 호출
      onResetState();
    }
  };

  return (
    <div className='space-y-6'>
      <div className='bg-secondary/30 border border-secondary/50 rounded-lg p-4'>
        <p className='text-sm text-foreground text-center'>
          {email}로 인증 코드를 발송했습니다.
        </p>
      </div>

      {/* 인증 시도 제한 알림 */}
      {verificationAttempts > 0 && (
        <div className='bg-amber-50 border border-amber-200 rounded-lg p-3'>
          <div className='flex items-center space-x-2'>
            <AlertTriangle className='w-4 h-4 text-amber-600' />
            <p className='text-sm text-amber-800'>
              인증 시도: {verificationAttempts}/3회
            </p>
          </div>
        </div>
      )}

      {/* 차단 상태 알림 */}
      {isBlocked && (
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <div className='flex items-center space-x-2 mb-2'>
            <AlertTriangle className='w-4 h-4 text-red-600' />
            <p className='text-sm font-medium text-red-800'>
              인증이 차단되었습니다
            </p>
          </div>
          <p className='text-sm text-red-700 mb-3'>
            인증 시도 횟수를 초과했습니다. 처음부터 다시 시도해주세요.
          </p>
          <Button
            type='button'
            onClick={handleResetState}
            variant='outline'
            size='sm'
            className='text-red-700 border-red-300 hover:bg-red-50'
          >
            처음부터 다시 시작
          </Button>
        </div>
      )}

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
              disabled={isBlocked} // 차단된 상태에서는 입력 비활성화
              aria-invalid={verificationAttempts > 0} // 접근성 개선
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
                message.type === 'success'
                  ? 'text-green-700'
                  : 'text-destructive'
              }`}
              role='alert'
            >
              {message.message}
            </p>
          </div>
        )}

        <div className='text-center'>
          <p className='text-muted-foreground text-sm mb-2'>
            인증 코드를 받지 못하셨나요?
          </p>
          <Button
            type='button'
            onClick={handleResendCode}
            variant='outline'
            size='sm'
            disabled={isLoading || isBlocked} // 차단된 상태에서는 재전송 비활성화
            className='text-primary hover:bg-primary/10'
          >
            {isLoading ? (
              <>
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                발송 중...
              </>
            ) : (
              '인증 코드 재발송'
            )}
          </Button>
        </div>

        <Button
          type='submit'
          className='w-full bg-primary hover:bg-primary-dark text-primary-foreground'
          disabled={isLoading || isBlocked} // 차단된 상태에서는 제출 비활성화
        >
          {isLoading ? (
            <>
              <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              인증 중...
            </>
          ) : isBlocked ? (
            '인증 차단됨'
          ) : (
            '인증 확인'
          )}
        </Button>
      </form>
    </div>
  );
};
