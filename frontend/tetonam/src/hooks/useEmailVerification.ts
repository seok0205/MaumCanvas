import { authService } from '@/services/authService';
import { useCallback, useState } from 'react';

interface UseEmailVerificationReturn {
  isEmailSent: boolean;
  isEmailVerified: boolean;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  sendEmailVerification: (email: string, signal?: AbortSignal) => Promise<void>;
  verifyEmail: (
    email: string,
    code: string,
    signal?: AbortSignal
  ) => Promise<void>;
  resetState: () => void;
}

export const useEmailVerification = (): UseEmailVerificationReturn => {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const sendEmailVerification = useCallback(
    async (email: string, signal?: AbortSignal): Promise<void> => {
      if (!email) {
        setError('이메일 주소를 입력해주세요.');
        setSuccessMessage(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      try {
        // 1단계: 이메일 중복 확인
        await authService.checkEmailDuplicate(email, signal);

        // 2단계: 중복이 아닌 경우 인증메일 발송
        await authService.sendEmailVerification(email, signal);

        setIsEmailSent(true);
        setSuccessMessage('이메일로 인증번호가 발송되었습니다.');
      } catch (error) {
        // AbortError는 사용자에게 표시하지 않음
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }

        // 에러 메시지를 그대로 사용 (authService에서 이미 구체적인 메시지 제공)
        const errorMessage =
          error instanceof Error
            ? error.message
            : '이메일 인증 과정에서 오류가 발생했습니다.';
        setError(errorMessage);
        setSuccessMessage(null);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const verifyEmail = useCallback(
    async (
      email: string,
      code: string,
      signal?: AbortSignal
    ): Promise<void> => {
      if (!email || !code) {
        setError('이메일과 인증번호를 모두 입력해주세요.');
        setSuccessMessage(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      try {
        // 실제 이메일 인증 API 호출
        const isVerified = await authService.verifyEmailCode(
          email,
          code,
          signal
        );

        if (isVerified) {
          setIsEmailVerified(true);
          setSuccessMessage('이메일 인증이 완료되었습니다.');
        } else {
          setError('인증번호가 올바르지 않습니다.');
          setSuccessMessage(null);
        }
      } catch (error) {
        // AbortError는 사용자에게 표시하지 않음
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }

        const errorMessage =
          error instanceof Error
            ? error.message
            : '이메일 인증에 실패했습니다.';
        setError(errorMessage);
        setSuccessMessage(null);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // 상태 초기화 함수도 useCallback으로 최적화
  const resetState = useCallback(() => {
    setIsEmailSent(false);
    setIsEmailVerified(false);
    setIsLoading(false);
    setError(null);
    setSuccessMessage(null);
  }, []);

  return {
    isEmailSent,
    isEmailVerified,
    isLoading,
    error,
    successMessage,
    sendEmailVerification,
    verifyEmail,
    resetState,
  };
};
