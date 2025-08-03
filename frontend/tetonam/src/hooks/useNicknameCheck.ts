import { authService } from '@/services/authService';
import { useCallback, useState } from 'react';

interface UseNicknameCheckReturn {
  isNicknameChecked: boolean;
  isAvailable: boolean;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  checkNickname: (nickname: string, signal?: AbortSignal) => Promise<void>;
  resetState: () => void;
}

// 닉네임 유효성 검사 규칙
const NICKNAME_REGEX = /^[가-힣a-zA-Z0-9]{2,10}$/;
const NICKNAME_MIN_LENGTH = 2;
const NICKNAME_MAX_LENGTH = 10;

export const useNicknameCheck = (): UseNicknameCheckReturn => {
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 유효성 검사 함수를 useCallback으로 최적화
  const validateNickname = useCallback((nickname: string): string | null => {
    if (!nickname.trim()) {
      return '닉네임을 입력해주세요.';
    }

    if (nickname.length < NICKNAME_MIN_LENGTH) {
      return `닉네임은 최소 ${NICKNAME_MIN_LENGTH}자 이상이어야 합니다.`;
    }

    if (nickname.length > NICKNAME_MAX_LENGTH) {
      return `닉네임은 최대 ${NICKNAME_MAX_LENGTH}자까지 가능합니다.`;
    }

    if (!NICKNAME_REGEX.test(nickname)) {
      return '닉네임은 한글, 영문, 숫자만 사용 가능합니다.';
    }

    return null;
  }, []);

  const checkNickname = useCallback(
    async (nickname: string, signal?: AbortSignal): Promise<void> => {
      const validationError = validateNickname(nickname);
      if (validationError) {
        setError(validationError);
        setSuccessMessage(null);
        setIsNicknameChecked(false);
        setIsAvailable(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      try {
        // 실제 닉네임 중복 체크 API 호출
        await authService.checkNicknameDuplicate(nickname, signal);

        setIsNicknameChecked(true);
        setIsAvailable(true);
        setSuccessMessage('해당 닉네임을 사용할 수 있습니다.');
      } catch (error) {
        // AbortError는 사용자에게 표시하지 않음
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }

        const errorMessage =
          error instanceof Error
            ? error.message
            : '닉네임 확인에 실패했습니다.';
        setError(errorMessage);
        setSuccessMessage(null);
        setIsNicknameChecked(false);
        setIsAvailable(false);
      } finally {
        setIsLoading(false);
      }
    },
    [validateNickname]
  );

  // 상태 초기화 함수도 useCallback으로 최적화
  const resetState = useCallback(() => {
    setIsNicknameChecked(false);
    setIsAvailable(false);
    setIsLoading(false);
    setError(null);
    setSuccessMessage(null);
  }, []);

  return {
    isNicknameChecked,
    isAvailable,
    isLoading,
    error,
    successMessage,
    checkNickname,
    resetState,
  };
};
