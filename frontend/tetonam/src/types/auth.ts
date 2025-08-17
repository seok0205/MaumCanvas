// 인증 관련 에러 타입 - 백엔드 API 문서 기반
export interface AuthError {
  type: 'network' | 'validation' | 'authentication' | 'server';
  code: string;
  message: string;
  details?: string | undefined;
}

export class AuthenticationError extends Error {
  public readonly code: string;
  public readonly details?: string | undefined;

  constructor(code: string, message: string, details?: string | undefined) {
    super(message);
    this.name = 'AuthenticationError';
    this.code = code;
    this.details = details;
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

// 백엔드 API 에러 코드 매핑
export const API_ERROR_CODES = {
  // 일반 에러
  COMMON400: '잘못된 요청입니다.',
  COMMON401: '인증이 필요합니다.',
  COMMON403: '금지된 요청입니다.',
  COMMON500: '서버 에러, 관리자에게 문의 바랍니다.',

  // 토큰 관련 에러
  TOKEN4001: '액세스 토큰이 만료되었습니다',
  TOKEN4002: '잘못된 토큰 입니다.',
  TOKEN4003: '지원되지 않는 JWT 토큰입니다.',
  TOKEN4004: 'JWT 토큰이 잘못되었습니다.',
  TOKEN4005: 'Refresh Token 정보가 유효하지 않습니다.',
  TOKEN4005_1: 'Refresh Token 정보가 일치하지 않습니다.',
  TOKEN4006: '권한 정보가 없는 토큰입니다.',
  TOKEN4007: 'Refresh Token이 만료되었습니다.',
  TOKEN4008: '인증 정보가 없는 토큰입니다.',

  // 사용자 관련 에러
  USER4000: '사용중인 이메일 입니다.',
  USER4001: '사용중인 닉네임 입니다',
  USER4002: '해당 유저가 없습니다',
  USER4003: '로그인 정보가 일치하지 않습니다.',
  USER4004: '아이디를 잘못 입력했습니다',

  // 이메일 관련 에러
  MAIL4000: '인증번호를 입력해주세요 / 인증번호가 틀렸습니다',
  MAIL5000: '이메일 전송에 에러가 발생했습니다.',

  // 이미지 관련 에러
  IMAGE4000: '잘못된 형식의 파일 입니다',
  IMAGE5000: '이미지를 저장할 수 없습니다 (S3 에러)',
} as const;

export type ApiErrorCode = keyof typeof API_ERROR_CODES;

// 인증 관련 응답 타입 (기존 호환성을 위해 유지)
export interface AuthResponse<T = any> {
  success: boolean;
  data?: T;
  error?: AuthError;
}

// 기존 타입들 (호환성을 위해 유지)
export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    nickname: string;
    gender: string;
    phone: string;
    school: string;
    birthday: string;
    roles: string[]; // 백엔드의 roles 배열에 맞춤
    createdAt: string;
  };
  token: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    name: string;
    nickname: string;
    gender: string;
    phone: string;
    school: string;
    birthday: string;
    roles: string[]; // 백엔드의 roles 배열에 맞춤
    createdAt: string;
  };
  token: string;
}
