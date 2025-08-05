import { ERROR_CODES, USER_FRIENDLY_MESSAGES } from '@/constants/errors';
import { AuthenticationError } from '@/types/auth';

/**
 * 보안을 고려하여 사용자에게 노출할 에러 메시지를 반환합니다.
 */
export const getSecureErrorMessage = (errorCode: string): string => {
  // 보안 민감한 에러 코드들 (사용자에게 노출하지 않음)
  const securitySensitiveCodes = [
    ERROR_CODES.TOKEN4002,
    ERROR_CODES.TOKEN4003,
    ERROR_CODES.TOKEN4004,
    ERROR_CODES.TOKEN4005,
    ERROR_CODES.TOKEN4006,
    ERROR_CODES.USER4002,
    ERROR_CODES.COMMON500,
    ERROR_CODES.MAIL5000,
    ERROR_CODES.IMAGE5000,
    ERROR_CODES.AI_SERVER5000,
  ];

  // 인증 관련 에러 코드들
  const authenticationCodes = [
    ERROR_CODES.TOKEN4001,
    ERROR_CODES.TOKEN4007,
    ERROR_CODES.TOKEN4008,
    ERROR_CODES.COMMON401,
    ERROR_CODES.USER4003,
    ERROR_CODES.USER4004,
  ];

  // 권한 관련 에러 코드들
  const authorizationCodes = [ERROR_CODES.COMMON403];

  // 입력 검증 에러 코드들
  const validationCodes = [ERROR_CODES.COMMON400, ERROR_CODES.AI_SERVER4000];

  // 보안 민감한 에러는 내부 로깅하고 일반적인 메시지 반환
  if (securitySensitiveCodes.includes(errorCode as any)) {
    console.warn(`보안 민감한 에러 발생: ${errorCode}`);
    return USER_FRIENDLY_MESSAGES.SECURITY_SENSITIVE;
  }

  // 인증 관련 에러
  if (authenticationCodes.includes(errorCode as any)) {
    return USER_FRIENDLY_MESSAGES.AUTHENTICATION;
  }

  // 권한 관련 에러
  if (authorizationCodes.includes(errorCode as any)) {
    return USER_FRIENDLY_MESSAGES.AUTHORIZATION;
  }

  // 입력 검증 에러
  if (validationCodes.includes(errorCode as any)) {
    return USER_FRIENDLY_MESSAGES.VALIDATION;
  }

  // 비즈니스 로직 에러 (구체적 안내)
  const businessMessages = USER_FRIENDLY_MESSAGES.BUSINESS_LOGIC as Record<
    string,
    string
  >;
  if (businessMessages[errorCode]) {
    return businessMessages[errorCode];
  }

  return USER_FRIENDLY_MESSAGES.DEFAULT;
};

/**
 * 백엔드 에러 코드를 기반으로 AuthenticationError를 생성합니다.
 */
export const createAuthError = (
  errorCode: string,
  customMessage?: string
): AuthenticationError => {
  const message = customMessage || getSecureErrorMessage(errorCode);
  return new AuthenticationError(errorCode, message);
};

/**
 * API 응답 에러를 처리하여 적절한 AuthenticationError를 반환합니다.
 */
export const handleApiError = (apiError: any): AuthenticationError => {
  const errorCode = apiError.code || 'UNKNOWN_ERROR';
  const message = getSecureErrorMessage(errorCode);

  // 보안 민감한 에러는 내부 로깅
  const securitySensitiveCodes = [
    ERROR_CODES.TOKEN4002,
    ERROR_CODES.TOKEN4003,
    ERROR_CODES.TOKEN4004,
    ERROR_CODES.TOKEN4005,
    ERROR_CODES.TOKEN4006,
    ERROR_CODES.USER4002,
    ERROR_CODES.COMMON500,
    ERROR_CODES.MAIL5000,
    ERROR_CODES.IMAGE5000,
    ERROR_CODES.AI_SERVER5000,
  ];

  if (securitySensitiveCodes.includes(errorCode as any)) {
    console.error('API 에러 상세 정보:', {
      code: errorCode,
      message: apiError.message,
      timestamp: new Date().toISOString(),
    });
  }

  return new AuthenticationError(errorCode, message);
};

/**
 * 네트워크 에러를 처리합니다.
 */
export const handleNetworkError = (error: any): AuthenticationError => {
  if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
    return new AuthenticationError(
      'NETWORK_ERROR',
      '네트워크 연결을 확인해주세요.'
    );
  }

  if (error.name === 'AbortError') {
    return new AuthenticationError('ABORTED', '요청이 취소되었습니다.');
  }

  return new AuthenticationError(
    'UNKNOWN_ERROR',
    USER_FRIENDLY_MESSAGES.DEFAULT
  );
};

/**
 * HTTP 상태 코드를 기반으로 에러를 처리합니다.
 */
export const handleHttpError = (status: number): AuthenticationError => {
  switch (status) {
    case 400:
      return createAuthError(ERROR_CODES.COMMON400);
    case 401:
      return createAuthError(ERROR_CODES.COMMON401);
    case 403:
      return createAuthError(ERROR_CODES.COMMON403);
    case 500:
      return createAuthError(ERROR_CODES.COMMON500);
    default:
      return createAuthError('UNKNOWN_ERROR');
  }
};
