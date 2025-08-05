import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { authService } from '@/services/authService';

interface UseNicknameEditReturn {
  nickname: string;
  isEditing: boolean;
  isDuplicateChecking: boolean;
  isDuplicateChecked: boolean;
  setNickname: (value: string) => void;
  setIsEditing: (value: boolean) => void;
  handleDuplicateCheck: () => Promise<void>;
  handleSave: () => Promise<void>;
  handleCancel: () => void;
}

export const useNicknameEdit = (
  initialNickname: string
): UseNicknameEditReturn => {
  const [nickname, setNickname] = useState(initialNickname);
  const [originalNickname, setOriginalNickname] = useState(initialNickname);
  const [isEditing, setIsEditing] = useState(false);
  const [isDuplicateChecking, setIsDuplicateChecking] = useState(false);
  const [isDuplicateChecked, setIsDuplicateChecked] = useState(false);

  // 초기 닉네임 설정
  useEffect(() => {
    setNickname(initialNickname);
    setOriginalNickname(initialNickname);
  }, [initialNickname]);

  // 닉네임 변경 감지
  useEffect(() => {
    if (nickname !== originalNickname) {
      setIsDuplicateChecked(false);
    }
  }, [nickname, originalNickname]);

  // 중복확인
  const handleDuplicateCheck = useCallback(async () => {
    if (!nickname.trim()) {
      toast.error('닉네임을 입력해주세요.');
      return;
    }

    try {
      setIsDuplicateChecking(true);
      await authService.checkNicknameDuplicate(nickname);
      setIsDuplicateChecked(true);
      toast.success('사용 가능한 닉네임입니다.');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('닉네임 중복확인에 실패했습니다.');
      }
    } finally {
      setIsDuplicateChecking(false);
    }
  }, [nickname]);

  // 저장
  const handleSave = useCallback(async () => {
    if (!isDuplicateChecked) {
      toast.error('중복확인을 완료해주세요.');
      return;
    }

    try {
      await authService.updateMyNickname(nickname);
      setOriginalNickname(nickname);
      setIsEditing(false);
      setIsDuplicateChecked(false);
      toast.success('닉네임이 변경되었습니다.');
    } catch (error) {
      toast.error('닉네임 변경에 실패했습니다.');
    }
  }, [isDuplicateChecked, nickname]);

  // 취소
  const handleCancel = useCallback(() => {
    setNickname(originalNickname);
    setIsEditing(false);
    setIsDuplicateChecked(false);
  }, [originalNickname]);

  return {
    nickname,
    isEditing,
    isDuplicateChecking,
    isDuplicateChecked,
    setNickname,
    setIsEditing,
    handleDuplicateCheck,
    handleSave,
    handleCancel,
  };
};
