/**
 * 상담 관련 에러 핸들링 유틸리티
 * React Router 베스트 프랙티스에 따른 에러 처리
 */

import { AuthenticationError } from '@/types/auth';

// 에러 타입 분류
export interface CounselingErrorType {
  code: string;
  message: string;
  userMessage: string;
  isRetryable: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// 알려진 에러 코드와 대응 메시지
const ERROR_MAPPINGS: Record<string, CounselingErrorType> = {
  COUNSELING4001: {
    code: 'COUNSELING4001',
    message: '상담예약이 없습니다',
    userMessage: '예정된 상담이 없습니다.',
    isRetryable: false,
    severity: 'low',
  },
  COMMON400: {
    code: 'COMMON400',
    message: '잘못된 요청입니다',
    userMessage:
      '요청에 문제가 있습니다. 페이지를 새로고침하고 다시 시도해주세요.',
    isRetryable: false,
    severity: 'medium',
  },
  COMMON401: {
    code: 'COMMON401',
    message: '인증이 필요합니다',
    userMessage: '로그인이 만료되었습니다. 다시 로그인해주세요.',
    isRetryable: false,
    severity: 'high',
  },
  COMMON403: {
    code: 'COMMON403',
    message: '금지된 요청입니다',
    userMessage: '접근 권한이 없습니다.',
    isRetryable: false,
    severity: 'high',
  },
  COMMON500: {
    code: 'COMMON500',
    message: '서버 에러',
    userMessage:
      '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
    isRetryable: true,
    severity: 'high',
  },
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    message: '네트워크 에러',
    userMessage: '네트워크 연결을 확인해주세요.',
    isRetryable: true,
    severity: 'medium',
  },
  TIMEOUT_ERROR: {
    code: 'TIMEOUT_ERROR',
    message: '요청 시간 초과',
    userMessage: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
    isRetryable: true,
    severity: 'medium',
  },
  INVALID_DATA_FORMAT: {
    code: 'INVALID_DATA_FORMAT',
    message: '잘못된 데이터 형식',
    userMessage:
      '잘못된 형식의 데이터를 받았습니다. 새로고침 후 다시 시도해주세요.',
    isRetryable: true,
    severity: 'medium',
  },
} as const;

/**
 * 에러 코드로 에러 정보를 가져옵니다
 */
export const getErrorInfo = (errorCode: string): CounselingErrorType => {
  return (
    ERROR_MAPPINGS[errorCode] || {
      code: errorCode,
      message: '알 수 없는 오류',
      userMessage: '알 수 없는 오류가 발생했습니다. 다시 시도해주세요.',
      isRetryable: false,
      severity: 'medium',
    }
  );
};

/**
 * AuthenticationError로부터 에러 정보를 추출합니다
 */
export const extractCounselingError = (
  error: AuthenticationError
): CounselingErrorType => {
  return getErrorInfo(error.code);
};

/**
 * 재시도 가능한 에러인지 확인합니다
 */
export const isRetryableError = (error: AuthenticationError): boolean => {
  const errorInfo = extractCounselingError(error);
  return errorInfo.isRetryable;
};

/**
 * 에러 심각도를 확인합니다
 */
export const getErrorSeverity = (
  error: AuthenticationError
): 'low' | 'medium' | 'high' | 'critical' => {
  const errorInfo = extractCounselingError(error);
  return errorInfo.severity;
};

/**
 * 사용자 친화적인 에러 메시지를 생성합니다
 */
export const generateUserFriendlyMessage = (
  error: AuthenticationError,
  context?: { retryCount?: number; maxRetries?: number }
): string => {
  const errorInfo = extractCounselingError(error);
  let message = errorInfo.userMessage;

  // 재시도 정보가 있는 경우 추가
  if (context?.retryCount && context?.maxRetries) {
    if (errorInfo.isRetryable && context.retryCount < context.maxRetries) {
      message += ` (${context.retryCount}/${context.maxRetries} 재시도 중)`;
    } else if (context.retryCount >= context.maxRetries) {
      message += ' 여러 번 시도했지만 실패했습니다.';
    }
  }

  return message;
};

/**
 * 에러 로깅을 위한 구조화된 데이터를 생성합니다
 */
export const createErrorLogData = (
  error: AuthenticationError,
  context?: Record<string, unknown>
) => {
  const errorInfo = extractCounselingError(error);

  return {
    timestamp: new Date().toISOString(),
    error: {
      code: error.code,
      message: error.message,
      stack: error.stack,
    },
    errorInfo,
    context,
    userAgent: navigator.userAgent,
    url: window.location.href,
  };
};
