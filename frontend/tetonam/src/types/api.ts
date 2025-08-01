// API 관련 타입 - 백엔드 API 문서 기반
export interface ApiResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T | null;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  result: T[] | null;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth 관련 타입
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  nickname: string;
  name: string;
  gender: 'MALE' | 'FEMALE' | 'OTHERS';
  phone: string;
  school: {
    name: string;
    grade: number;
  };
  birthday: string;
  roles: string[]; // 백엔드의 roles 배열에 맞춤
}

export interface ResetPasswordData {
  email: string;
  newPassword: string;
}

export interface EmailVerificationData {
  email: string;
  authNum: string;
}

export interface TokenReissueData {
  accessToken: string;
  refreshToken: string;
}

// JWT 토큰 응답 타입 - 백엔드 API와 일치
export interface JwtTokenResponse {
  grantType: string;
  accessToken: string;
  refreshToken: string;
  refreshTokenExpirationTime: number;
  roles: string[]; // 백엔드에서 제공하는 roles 배열
}

// 사용자 정보 응답 타입
export interface UserInfoResponse {
  id?: string; // ID 필드 추가 (백엔드에서 제공하는 경우)
  name: string;
  birthday: string;
  phone: string;
  school: string;
  email: string;
  gender: string;
  nickname: string;
  roles: string[]; // 백엔드에서 제공하는 roles 배열
}

// 회원가입 응답 타입
export interface RegisterResponse {
  id: number;
  username: string;
  nickname: string;
}

// 상담사 정보 타입
export interface CounselorInfo {
  id: number;
  counselorName: string;
}

// 상담 예약 요청 타입
export interface CounselingReservationRequest {
  time: string;
  types: string;
  CounselorId: number;
}

// 상담 내역 타입
export interface CounselingHistory {
  id: number;
  counselor: string;
  time: string;
  type: string;
  status: string;
}
