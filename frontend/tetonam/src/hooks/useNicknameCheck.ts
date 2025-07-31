import { useCallback, useState } from 'react';

interface UseNicknameCheckReturn {
  isNicknameChecked: boolean;
  isAvailable: boolean;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  checkNickname: (nickname: string) => Promise<void>;
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

  // 단순한 유효성 검사 함수는 useCallback 불필요
  const validateNickname = (nickname: string): string | null => {
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
  };

  const checkNickname = useCallback(async (nickname: string): Promise<void> => {
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
      // TODO: 실제 닉네임 중복 체크 API 호출
      // const isAvailable = await nicknameService.checkAvailability(nickname);

      // 모의 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 모의 결과 (실제로는 API 응답에 따라 결정)
      const mockIsAvailable = !['admin', 'test', 'user'].includes(
        nickname.toLowerCase()
      );

      setIsNicknameChecked(true);
      setIsAvailable(mockIsAvailable);

      if (mockIsAvailable) {
        setSuccessMessage('해당 닉네임을 사용할 수 있습니다.');
      } else {
        setError('이미 사용 중인 닉네임입니다.');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '닉네임 확인에 실패했습니다.';
      setError(errorMessage);
      setSuccessMessage(null);
      setIsNicknameChecked(false);
      setIsAvailable(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 단순한 상태 초기화 함수는 useCallback 불필요
  const resetState = () => {
    setIsNicknameChecked(false);
    setIsAvailable(false);
    setIsLoading(false);
    setError(null);
    setSuccessMessage(null);
  };

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
