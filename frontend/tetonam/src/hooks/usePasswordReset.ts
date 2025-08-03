import { useCallback, useRef, useState } from 'react';

import { PASSWORD_RESET_ERROR_MESSAGES } from '@/constants/passwordReset';
import { authService } from '@/services/authService';
import type { AsyncState } from '@/types/common';

export interface PasswordResetState {
  emailStep: AsyncState<void>;
  verificationStep: AsyncState<string>; // UUID를 저장하도록 변경
  resetStep: AsyncState<void>;
  currentStep: number;
  email: string;
  verificationCode: string;
  uuid: string; // UUID 추가
  // 인증 시도 제한 관련 상태 추가
  verificationAttempts: number;
  isBlocked: boolean;
}

const MAX_VERIFICATION_ATTEMPTS = 3; // 인증 시도 최대 3회

// 비밀번호 재설정 비즈니스 로직을 분리한 커스텀 훅
export const usePasswordReset = () => {
  const [state, setState] = useState<PasswordResetState>({
    emailStep: { data: null, isLoading: false, error: null },
    verificationStep: { data: null, isLoading: false, error: null },
    resetStep: { data: null, isLoading: false, error: null },
    currentStep: 1,
    email: '',
    verificationCode: '',
    uuid: '', // UUID 초기화
    verificationAttempts: 0, // 인증 시도 횟수 초기화
    isBlocked: false, // 차단 상태 초기화
  });

  // 최신 state 값에 안전하게 접근하기 위한 ref
  const stateRef = useRef(state);
  stateRef.current = state;

  // 인증 시도 제한 체크
  const isMaxAttemptsReached =
    state.verificationAttempts >= MAX_VERIFICATION_ATTEMPTS;

  // 이메일 인증 코드 발송
  const requestPasswordReset = useCallback(async (email: string) => {
    setState(prev => ({
      ...prev,
      emailStep: { data: null, isLoading: true, error: null },
      email,
    }));

    // Race condition 방지를 위한 ignore 플래그
    let ignore = false;

    try {
      await authService.requestPasswordReset(email);

      // 컴포넌트가 언마운트되었거나 다른 요청이 시작된 경우 상태 업데이트 방지
      if (!ignore) {
        setState(prev => ({
          ...prev,
          emailStep: { data: null, isLoading: false, error: null },
          currentStep: 2,
        }));
      }
    } catch (error) {
      if (!ignore) {
        setState(prev => ({
          ...prev,
          emailStep: {
            data: null,
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : PASSWORD_RESET_ERROR_MESSAGES.EMAIL_SEND_FAILED,
          },
        }));
      }
    }

    return () => {
      ignore = true;
    };
  }, []);

  // 이메일 인증 코드 확인 (UUID 반환)
  const verifyResetCode = useCallback(
    async (code: string) => {
      // 인증 시도 제한 체크
      if (isMaxAttemptsReached) {
        setState(prev => ({
          ...prev,
          isBlocked: true,
          verificationStep: {
            data: null,
            isLoading: false,
            error: PASSWORD_RESET_ERROR_MESSAGES.MAX_ATTEMPTS,
          },
        }));
        console.warn(
          `비밀번호 재설정 인증 시도 제한 초과: ${stateRef.current.email}`
        );
        return;
      }

      setState(prev => ({
        ...prev,
        verificationStep: { data: null, isLoading: true, error: null },
        verificationCode: code,
        verificationAttempts: prev.verificationAttempts + 1, // 인증 시도 횟수 증가
      }));

      // Race condition 방지를 위한 ignore 플래그
      let ignore = false;

      try {
        // ref를 통해 최신 state 값에 안전하게 접근
        const uuid = await authService.verifyResetCode(
          stateRef.current.email,
          code
        );

        if (!ignore) {
          if (uuid) {
            setState(prev => ({
              ...prev,
              verificationStep: { data: uuid, isLoading: false, error: null },
              uuid, // UUID 저장
              currentStep: 3,
              isBlocked: false, // 성공 시 차단 해제
            }));
            console.log(`비밀번호 재설정 인증 성공: ${stateRef.current.email}`);
          } else {
            setState(prev => ({
              ...prev,
              verificationStep: {
                data: null,
                isLoading: false,
                error: PASSWORD_RESET_ERROR_MESSAGES.INVALID_VERIFICATION_CODE,
              },
            }));
            console.warn(
              `비밀번호 재설정 인증 실패: ${stateRef.current.email} (${stateRef.current.verificationAttempts + 1}번째 시도)`
            );
          }
        }
      } catch (error) {
        if (!ignore) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : PASSWORD_RESET_ERROR_MESSAGES.VERIFICATION_FAILED;

          setState(prev => ({
            ...prev,
            verificationStep: {
              data: null,
              isLoading: false,
              error: errorMessage,
            },
          }));

          // 3회 실패 시 차단
          if (
            stateRef.current.verificationAttempts + 1 >=
            MAX_VERIFICATION_ATTEMPTS
          ) {
            setState(prev => ({
              ...prev,
              isBlocked: true,
            }));
            console.warn(
              `비밀번호 재설정 인증 시도 제한 도달: ${stateRef.current.email}`
            );
          }

          console.error(
            `비밀번호 재설정 인증 실패: ${stateRef.current.email}`,
            error
          );
        }
      }

      return () => {
        ignore = true;
      };
    },
    [isMaxAttemptsReached] // 인증 시도 제한 의존성 추가
  );

  // 비밀번호 재설정 (UUID 포함)
  const resetPassword = useCallback(
    async (newPassword: string) => {
      setState(prev => ({
        ...prev,
        resetStep: { data: null, isLoading: true, error: null },
      }));

      // AbortController를 사용한 비동기 작업 취소
      const abortController = new AbortController();

      try {
        // ref를 통해 최신 state 값에 안전하게 접근
        await authService.resetPassword(
          stateRef.current.email,
          stateRef.current.uuid, // UUID 전달
          newPassword
        );

        if (!abortController.signal.aborted) {
          setState(prev => ({
            ...prev,
            resetStep: { data: null, isLoading: false, error: null },
          }));
        }
        return true;
      } catch (error) {
        if (!abortController.signal.aborted) {
          setState(prev => ({
            ...prev,
            resetStep: {
              data: null,
              isLoading: false,
              error:
                error instanceof Error
                  ? error.message
                  : PASSWORD_RESET_ERROR_MESSAGES.PASSWORD_RESET_FAILED,
            },
          }));
        }
        return false;
      }

      return () => {
        abortController.abort();
      };
    },
    [] // 의존성 배열이 비어있어도 ref를 통해 최신 값에 접근 가능
  );

  // 단순한 재전송 함수 - useCallback 불필요
  const resendCode = async () => {
    const currentEmail = stateRef.current.email;
    if (currentEmail) {
      await requestPasswordReset(currentEmail);
    }
  };

  // 상태 초기화 함수 (차단 해제용)
  const resetVerificationState = useCallback(() => {
    setState(prev => ({
      ...prev,
      verificationAttempts: 0,
      isBlocked: false,
      verificationStep: { data: null, isLoading: false, error: null },
    }));
  }, []);

  return {
    ...state,
    requestPasswordReset,
    verifyResetCode,
    resetPassword,
    resendCode,
    resetVerificationState, // 상태 초기화 함수 추가
  };
};
