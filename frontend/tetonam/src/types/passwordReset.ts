import { z } from 'zod';

// 폼 스키마 정의
export const emailSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
});

export const verificationSchema = z.object({
  code: z.string().length(6, '인증 코드는 6자리입니다'),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, '비밀번호는 8자 이상이어야 합니다')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        '영문 대소문자, 숫자를 포함해야 합니다'
      ),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  });

// 타입 정의
export type EmailFormData = z.infer<typeof emailSchema>;
export type VerificationFormData = z.infer<typeof verificationSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export type PasswordResetStep = 1 | 2 | 3;
