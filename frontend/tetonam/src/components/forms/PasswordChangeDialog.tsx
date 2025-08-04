import { useState } from 'react';
import { toast } from 'sonner';

import { PasswordInput } from '@/components/ui/forms/PasswordInput';
import { Button } from '@/components/ui/interactive/button';
import { authService } from '@/services/authService';

interface PasswordChangeDialogProps {
  onClose: () => void;
}

export const PasswordChangeDialog = ({
  onClose,
}: PasswordChangeDialogProps) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('비밀번호는 8자 이상이어야 합니다.');
      return;
    }

    try {
      setIsLoading(true);
      await authService.updateMyPassword(newPassword);

      toast.success('비밀번호가 변경되었습니다.');
      onClose();
    } catch (error) {
      toast.error('비밀번호 변경에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <PasswordInput
        label='새 비밀번호'
        placeholder='8자 이상 비밀번호'
        value={newPassword}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setNewPassword(e.target.value)
        }
        required
        minLength={8}
      />
      <p className='text-xs text-muted-foreground'>
        비밀번호는 8자 이상이어야 합니다.
      </p>

      <PasswordInput
        label='새 비밀번호 확인'
        placeholder='비밀번호 재입력'
        value={confirmPassword}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setConfirmPassword(e.target.value)
        }
        required
      />

      <div className='flex justify-end space-x-2 pt-4'>
        <Button type='button' variant='outline' onClick={onClose}>
          취소
        </Button>
        <Button type='submit' disabled={isLoading}>
          {isLoading ? '변경 중...' : '변경'}
        </Button>
      </div>
    </form>
  );
};
