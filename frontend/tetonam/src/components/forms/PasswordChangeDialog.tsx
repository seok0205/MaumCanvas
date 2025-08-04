// 내장 라이브러리
import { useState } from 'react';

// 외부 라이브러리
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

// 내부 모듈
import { PasswordInput } from '@/components/ui/forms/PasswordInput';
import { Button } from '@/components/ui/interactive/button';
import { FORM_CONSTANTS, FORM_MESSAGES } from '@/constants/forms';
import { authService } from '@/services/authService';

// 비밀번호 변경 스키마
const passwordChangeSchema = z
  .object({
    newPassword: z
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
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: FORM_MESSAGES.VALIDATION.PASSWORD_MISMATCH,
    path: ['confirmPassword'],
  });

type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

interface PasswordChangeDialogProps {
  onClose: () => void;
}

export const PasswordChangeDialog = ({
  onClose,
}: PasswordChangeDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
    mode: 'onBlur', // 포커스 아웃 시 유효성 검사
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleSubmit = async (data: PasswordChangeFormData) => {
    try {
      setIsLoading(true);
      await authService.updateMyPassword(data.newPassword);

      toast.success('비밀번호가 변경되었습니다.');
      onClose();
    } catch (error) {
      toast.error('비밀번호 변경에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
      {/* 새 비밀번호 */}
      <PasswordInput
        label='새 비밀번호'
        placeholder='8-15자리 비밀번호'
        {...form.register('newPassword')}
        error={form.formState.errors.newPassword?.message || undefined}
      />

      {/* 비밀번호 조건 안내 */}
      <div className='text-xs text-muted-foreground space-y-1'>
        <p>비밀번호 조건:</p>
        <ul className='list-disc list-inside space-y-1'>
          <li>8-15자리</li>
          <li>영문, 숫자, 특수문자 포함</li>
        </ul>
      </div>

      {/* 새 비밀번호 확인 */}
      <PasswordInput
        label='새 비밀번호 확인'
        placeholder='비밀번호 재입력'
        {...form.register('confirmPassword')}
        error={form.formState.errors.confirmPassword?.message || undefined}
      />

      {/* 버튼 영역 */}
      <div className='flex justify-end space-x-2 pt-4'>
        <Button type='button' variant='outline' onClick={onClose}>
          취소
        </Button>
        <Button type='submit' disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              변경 중...
            </>
          ) : (
            '변경'
          )}
        </Button>
      </div>
    </form>
  );
};
