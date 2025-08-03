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
}

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
  });

  // 최신 state 값에 안전하게 접근하기 위한 ref
  const stateRef = useRef(state);
  stateRef.current = state;

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
      setState(prev => ({
        ...prev,
        verificationStep: { data: null, isLoading: true, error: null },
        verificationCode: code,
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
            }));
          } else {
            setState(prev => ({
              ...prev,
              verificationStep: {
                data: null,
                isLoading: false,
                error: PASSWORD_RESET_ERROR_MESSAGES.INVALID_VERIFICATION_CODE,
              },
            }));
          }
        }
      } catch (error) {
        if (!ignore) {
          setState(prev => ({
            ...prev,
            verificationStep: {
              data: null,
              isLoading: false,
              error:
                error instanceof Error
                  ? error.message
                  : PASSWORD_RESET_ERROR_MESSAGES.VERIFICATION_FAILED,
            },
          }));
        }
      }

      return () => {
        ignore = true;
      };
    },
    [] // 의존성 배열이 비어있어도 ref를 통해 최신 값에 접근 가능
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

  return {
    ...state,
    requestPasswordReset,
    verifyResetCode,
    resetPassword,
    resendCode,
  };
};
