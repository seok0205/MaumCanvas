import { FormLayout } from '@/components/ui/forms/FormLayout';
import { PrivacyNotice } from '@/components/ui/forms/PrivacyNotice';
import { PASSWORD_RESET_CONSTANTS } from '@/constants/passwordReset';
import { useToast } from '@/hooks/use-toast';
import { usePasswordReset } from '@/hooks/usePasswordReset';
import { usePasswordResetSteps } from '@/hooks/usePasswordResetSteps';
import type {
  EmailFormData,
  PasswordResetStep,
  ResetPasswordFormData,
  VerificationFormData,
} from '@/types/passwordReset';
import React, { useCallback } from 'react';
import { EmailStepForm } from './passwordReset/EmailStepForm';
import { ProgressIndicator } from './passwordReset/ProgressIndicator';
import { ResetPasswordStepForm } from './passwordReset/ResetPasswordStepForm';
import { VerificationStepForm } from './passwordReset/VerificationStepForm';

export const PasswordResetForm = React.memo(() => {
  const { toast } = useToast();

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
      try {
        await requestPasswordReset(data.email);

        if (!emailStep.error) {
          toast({
            title: '인증 코드 발송',
            description: '입력하신 이메일로 인증 코드를 발송했습니다.',
          });
        }
      } catch (error) {
        toast({
          title: '오류 발생',
          description:
            error instanceof Error
              ? error.message
              : '알 수 없는 오류가 발생했습니다',
          variant: 'destructive',
        });
      }
    },
    [requestPasswordReset, emailStep.error, toast]
  );

  const handleVerificationSubmit = useCallback(
    async (data: VerificationFormData) => {
      try {
        await verifyResetCode(data.code);

        if (verificationStep.data === true) {
          toast({
            title: '인증 완료',
            description: '이제 새 비밀번호를 설정해주세요.',
          });
        }
      } catch (error) {
        toast({
          title: '인증 실패',
          description:
            error instanceof Error
              ? error.message
              : '인증 중 오류가 발생했습니다',
          variant: 'destructive',
        });
      }
    },
    [verifyResetCode, verificationStep.data, toast]
  );

  const handleResetPasswordSubmit = useCallback(
    async (data: ResetPasswordFormData) => {
      try {
        const success = await resetPassword(data.password);

        if (success) {
          toast({
            title: '비밀번호 변경 완료',
            description: '새 비밀번호로 로그인해주세요.',
          });
          window.location.href = PASSWORD_RESET_CONSTANTS.ROUTES.LOGIN;
        }
      } catch (error) {
        toast({
          title: '오류 발생',
          description:
            error instanceof Error
              ? error.message
              : '비밀번호 변경 중 오류가 발생했습니다',
          variant: 'destructive',
        });
      }
    },
    [resetPassword, toast]
  );

  const handleResendCode = useCallback(async () => {
    try {
      await resendCode();
      toast({
        title: '인증 코드 재발송',
        description: '새로운 인증 코드를 발송했습니다.',
      });
    } catch (error) {
      toast({
        title: '재발송 실패',
        description:
          error instanceof Error
            ? error.message
            : '인증 코드 재발송 중 오류가 발생했습니다',
        variant: 'destructive',
      });
    }
  }, [resendCode, toast]);

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
        />
      )}

      {/* 2단계: 인증 코드 입력 */}
      {currentStep === 2 && (
        <VerificationStepForm
          email={email}
          onSubmit={handleVerificationSubmit}
          onResendCode={handleResendCode}
          isLoading={verificationStep.isLoading}
        />
      )}

      {/* 3단계: 새 비밀번호 설정 */}
      {currentStep === 3 && (
        <ResetPasswordStepForm
          onSubmit={handleResetPasswordSubmit}
          isLoading={resetStep.isLoading}
        />
      )}
    </FormLayout>
  );
});

PasswordResetForm.displayName = 'PasswordResetForm';
