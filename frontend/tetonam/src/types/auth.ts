// 인증 관련 에러 타입
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

// 인증 관련 응답 타입
export interface AuthResponse<T = any> {
  success: boolean;
  data?: T;
  error?: AuthError;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    userType: string;
    createdAt: string;
  };
  token: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    name: string;
    userType: string;
    createdAt: string;
  };
  token: string;
}
