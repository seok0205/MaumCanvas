import { FORM_MESSAGES } from '@/constants/forms';
import { authService } from '@/services/authService';
import { useCallback, useMemo, useRef, useState } from 'react';

interface UseEmailVerificationReturn {
  isEmailSent: boolean;
  isEmailVerified: boolean;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  // 재전송 제한 관련
  resendCount: number;
  canResend: boolean;
  // 인증 시도 제한 관련
  verificationAttempts: number;
  isBlocked: boolean;
  // 이메일 중복 체크 관련
  isEmailDuplicateChecked: boolean;
  sendEmailVerification: (email: string, signal?: AbortSignal) => Promise<void>;
  verifyEmail: (
    email: string,
    code: string,
    signal?: AbortSignal
  ) => Promise<void>;
  resetState: () => void;
}

const MAX_RESEND_COUNT = 5; // 재전송 최대 5회
const MAX_VERIFICATION_ATTEMPTS = 3; // 인증 시도 최대 3회

export const useEmailVerification = (): UseEmailVerificationReturn => {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 재전송 제한 관련 상태
  const [resendCount, setResendCount] = useState(0);
  const [canResend, setCanResend] = useState(true);

  // 인증 시도 제한 관련 상태
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  // 이메일 중복 체크 관련 상태
  const [isEmailDuplicateChecked, setIsEmailDuplicateChecked] = useState(false);

  // 로깅을 위한 ref
  const logRef = useRef({
    email: '',
    attempts: 0,
    resends: 0,
  });

  // 성능 최적화: 계산된 값들을 메모이제이션
  const isMaxAttemptsReached = useMemo(() => {
    return verificationAttempts >= MAX_VERIFICATION_ATTEMPTS;
  }, [verificationAttempts]);

  const isMaxResendsReached = useMemo(() => {
    return resendCount >= MAX_RESEND_COUNT;
  }, [resendCount]);

  // 상태 초기화 함수
  const resetState = useCallback(() => {
    setIsEmailSent(false);
    setIsEmailVerified(false);
    setIsLoading(false);
    setError(null);
    setSuccessMessage(null);
    setResendCount(0);
    setCanResend(true);
    setVerificationAttempts(0);
    setIsBlocked(false);
    setIsEmailDuplicateChecked(false);

    // 로그 초기화
    logRef.current = {
      email: '',
      attempts: 0,
      resends: 0,
    };
  }, []);

  const sendEmailVerification = useCallback(
    async (email: string, signal?: AbortSignal): Promise<void> => {
      // 입력 검증
      if (!email?.trim()) {
        setError(FORM_MESSAGES.EMAIL_VERIFICATION.EMAIL_REQUIRED);
        setSuccessMessage(null);
        return;
      }

      // 로깅
      logRef.current.email = email;
      logRef.current.resends += 1;

      // 재전송 제한 체크
      if (isMaxResendsReached) {
        setError(FORM_MESSAGES.EMAIL_VERIFICATION.MAX_RESEND);
        setSuccessMessage(null);
        console.warn(`이메일 재전송 제한 초과: ${email}`);
        return;
      }

      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      try {
        // 1단계: 이메일 중복 확인
        await authService.checkEmailDuplicate(email, signal);
        setIsEmailDuplicateChecked(true);

        // 2단계: 중복이 아닌 경우 인증메일 발송
        await authService.sendEmailVerification(email, signal);

        setIsEmailSent(true);
        setResendCount(prev => prev + 1);
        setSuccessMessage(FORM_MESSAGES.EMAIL_VERIFICATION.SEND_SUCCESS);

        // 재전송 제한에 도달한 경우
        if (resendCount + 1 >= MAX_RESEND_COUNT) {
          setCanResend(false);
          console.warn(`이메일 재전송 제한 도달: ${email}`);
        }
      } catch (error) {
        // AbortError는 사용자에게 표시하지 않음
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }

        // 에러 로깅
        console.error(`이메일 인증 발송 실패: ${email}`, error);

        // 에러 메시지를 그대로 사용 (authService에서 이미 구체적인 메시지 제공)
        const errorMessage =
          error instanceof Error
            ? error.message
            : FORM_MESSAGES.EMAIL_VERIFICATION.PROCESS_ERROR;
        setError(errorMessage);
        setSuccessMessage(null);
        setIsEmailDuplicateChecked(false);
      } finally {
        setIsLoading(false);
      }
    },
    [isMaxResendsReached, resendCount] // 필요한 의존성만 포함
  );

  const verifyEmail = useCallback(
    async (
      email: string,
      code: string,
      signal?: AbortSignal
    ): Promise<void> => {
      // 입력 검증
      if (!email?.trim() || !code?.trim()) {
        setError(FORM_MESSAGES.EMAIL_VERIFICATION.CODE_REQUIRED);
        setSuccessMessage(null);
        return;
      }

      // 로깅
      logRef.current.attempts += 1;

      // 인증 시도 제한 체크
      if (isMaxAttemptsReached) {
        setIsBlocked(true);
        setError(FORM_MESSAGES.EMAIL_VERIFICATION.MAX_ATTEMPTS);
        setSuccessMessage(null);
        console.warn(`이메일 인증 시도 제한 초과: ${email}`);
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
          setSuccessMessage(
            FORM_MESSAGES.EMAIL_VERIFICATION.VERIFICATION_SUCCESS
          );
          // 인증 성공 시에도 isEmailSent는 유지하여 사용자가 인증 과정을 확인할 수 있도록
        } else {
          setVerificationAttempts(prev => prev + 1);
          setError(FORM_MESSAGES.EMAIL_VERIFICATION.INVALID_CODE);
          setSuccessMessage(null);

          // 3회 실패 시 차단
          if (verificationAttempts + 1 >= MAX_VERIFICATION_ATTEMPTS) {
            setIsBlocked(true);
            console.warn(`이메일 인증 시도 제한 도달: ${email}`);
          }
        }
      } catch (error) {
        // AbortError는 사용자에게 표시하지 않음
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }

        // 에러 로깅
        console.error(`이메일 인증 실패: ${email}`, error);

        setVerificationAttempts(prev => prev + 1);
        const errorMessage =
          error instanceof Error
            ? error.message
            : FORM_MESSAGES.EMAIL_VERIFICATION.VERIFICATION_FAILED;
        setError(errorMessage);
        setSuccessMessage(null);

        // 3회 실패 시 차단
        if (verificationAttempts + 1 >= MAX_VERIFICATION_ATTEMPTS) {
          setIsBlocked(true);
          console.warn(`이메일 인증 시도 제한 도달: ${email}`);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [isMaxAttemptsReached, verificationAttempts] // 필요한 의존성만 포함
  );

  return {
    isEmailSent,
    isEmailVerified,
    isLoading,
    error,
    successMessage,
    resendCount,
    canResend,
    verificationAttempts,
    isBlocked,
    isEmailDuplicateChecked,
    sendEmailVerification,
    verifyEmail,
    resetState,
  };
};
