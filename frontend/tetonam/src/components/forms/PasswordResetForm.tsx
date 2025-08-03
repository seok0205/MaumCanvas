import { FormLayout } from '@/components/ui/forms/FormLayout';
import { PrivacyNotice } from '@/components/ui/forms/PrivacyNotice';
import { PASSWORD_RESET_CONSTANTS } from '@/constants/passwordReset';
import { usePasswordReset } from '@/hooks/usePasswordReset';
import { usePasswordResetSteps } from '@/hooks/usePasswordResetSteps';
import type {
  EmailFormData,
  PasswordResetStep,
  ResetPasswordFormData,
  VerificationFormData,
} from '@/types/passwordReset';
import React, { useCallback, useState } from 'react';
import { EmailStepForm } from './passwordReset/EmailStepForm';
import { ProgressIndicator } from './passwordReset/ProgressIndicator';
import { ResetPasswordStepForm } from './passwordReset/ResetPasswordStepForm';
import { VerificationStepForm } from './passwordReset/VerificationStepForm';

export const PasswordResetForm = React.memo(() => {
  const [emailMessage, setEmailMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [verificationMessage, setVerificationMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [resetMessage, setResetMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const {
    currentStep,
    email,
    emailStep,
    verificationStep,
    resetStep,
    requestPasswordReset,
    verifyResetCode,
    resetPassword,
    resendCode,
  } = usePasswordReset();

  const { stepTitle, stepDescription, getStepProgress } = usePasswordResetSteps(
    {
      currentStep: currentStep as PasswordResetStep,
    }
  );

  const handleEmailSubmit = useCallback(
    async (data: EmailFormData) => {
      setEmailMessage(null);
      try {
        await requestPasswordReset(data.email);

        if (!emailStep.error) {
          setEmailMessage({
            type: 'success',
            message: '입력하신 이메일로 인증 코드를 발송했습니다.',
          });
        }
      } catch (error) {
        setEmailMessage({
          type: 'error',
          message:
            error instanceof Error
              ? error.message
              : '알 수 없는 오류가 발생했습니다',
        });
      }
    },
    [requestPasswordReset, emailStep.error]
  );

  const handleVerificationSubmit = useCallback(
    async (data: VerificationFormData) => {
      setVerificationMessage(null);
      try {
        await verifyResetCode(data.code);

        if (verificationStep.data === true) {
          setVerificationMessage({
            type: 'success',
            message: '이제 새 비밀번호를 설정해주세요.',
          });
        }
      } catch (error) {
        setVerificationMessage({
          type: 'error',
          message:
            error instanceof Error
              ? error.message
              : '인증 중 오류가 발생했습니다',
        });
      }
    },
    [verifyResetCode, verificationStep.data]
  );

  const handleResetPasswordSubmit = useCallback(
    async (data: ResetPasswordFormData) => {
      setResetMessage(null);
      try {
        const success = await resetPassword(data.password);

        if (success) {
          setResetMessage({
            type: 'success',
            message: '새 비밀번호로 로그인해주세요.',
          });
          // 성공 메시지 표시 후 잠시 대기 후 로그인 페이지로 이동
          setTimeout(() => {
            window.location.href = PASSWORD_RESET_CONSTANTS.ROUTES.LOGIN;
          }, 2000);
        }
      } catch (error) {
        setResetMessage({
          type: 'error',
          message:
            error instanceof Error
              ? error.message
              : '비밀번호 변경 중 오류가 발생했습니다',
        });
      }
    },
    [resetPassword]
  );

  const handleResendCode = useCallback(async () => {
    setVerificationMessage(null);
    try {
      await resendCode();
      setVerificationMessage({
        type: 'success',
        message: '새로운 인증 코드를 발송했습니다.',
      });
    } catch (error) {
      setVerificationMessage({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : '인증 코드 재발송 중 오류가 발생했습니다',
      });
    }
  }, [resendCode]);

  return (
    <FormLayout title={stepTitle} showBackButton={false}>
      <PrivacyNotice message={stepDescription} className='mb-6' />

      <ProgressIndicator
        currentStep={currentStep as PasswordResetStep}
        getStepProgress={getStepProgress}
      />

      {/* 1단계: 이메일 입력 */}
      {currentStep === 1 && (
        <EmailStepForm
          onSubmit={handleEmailSubmit}
          isLoading={emailStep.isLoading}
          message={emailMessage}
        />
      )}

      {/* 2단계: 인증 코드 입력 */}
      {currentStep === 2 && (
        <VerificationStepForm
          email={email}
          onSubmit={handleVerificationSubmit}
          onResendCode={handleResendCode}
          isLoading={verificationStep.isLoading}
          message={verificationMessage}
        />
      )}

      {/* 3단계: 새 비밀번호 설정 */}
      {currentStep === 3 && (
        <ResetPasswordStepForm
          onSubmit={handleResetPasswordSubmit}
          isLoading={resetStep.isLoading}
          message={resetMessage}
        />
      )}
    </FormLayout>
  );
});

PasswordResetForm.displayName = 'PasswordResetForm';
