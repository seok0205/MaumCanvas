import React from 'react';
import { PasswordResetForm } from './PasswordResetForm';

/**
 * ForgotPasswordForm 컴포넌트
 *
 * 비밀번호 찾기 기능을 위한 래핑 컴포넌트입니다.
 * PasswordResetForm을 감싸서 일관된 사용자 경험을 제공합니다.
 *
 * @returns PasswordResetForm 컴포넌트
 */
export const ForgotPasswordForm = (): React.ReactElement => {
  return <PasswordResetForm />;
};
