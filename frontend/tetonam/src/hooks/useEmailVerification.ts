import { useCallback, useState } from 'react';

interface UseEmailVerificationReturn {
  isEmailSent: boolean;
  isEmailVerified: boolean;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  sendEmailVerification: (email: string) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resetState: () => void;
}

export const useEmailVerification = (): UseEmailVerificationReturn => {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const sendEmailVerification = useCallback(
    async (email: string): Promise<void> => {
      if (!email) {
        setError('이메일 주소를 입력해주세요.');
        setSuccessMessage(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      try {
        // TODO: 실제 이메일 인증 API 호출
        // await emailVerificationService.sendVerificationEmail(email);

        // 모의 API 호출
        await new Promise(resolve => setTimeout(resolve, 1000));

        setIsEmailSent(true);
        setSuccessMessage('이메일로 인증번호가 발송되었습니다.');
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : '인증번호 발송에 실패했습니다.';
        setError(errorMessage);
        setSuccessMessage(null);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const verifyEmail = useCallback(
    async (email: string, code: string): Promise<void> => {
      if (!email || !code) {
        setError('이메일과 인증번호를 모두 입력해주세요.');
        setSuccessMessage(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      try {
        // TODO: 실제 이메일 인증 API 호출
        // await emailVerificationService.verifyEmail(email, code);

        // 모의 API 호출
        await new Promise(resolve => setTimeout(resolve, 1000));

        setIsEmailVerified(true);
        setSuccessMessage('이메일 인증이 완료되었습니다.');
      } catch (error) {
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

  // 단순한 상태 초기화 함수는 useCallback 불필요
  const resetState = () => {
    setIsEmailSent(false);
    setIsEmailVerified(false);
    setIsLoading(false);
    setError(null);
    setSuccessMessage(null);
  };

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
