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
  };
  birthday: string;
  roles: string[]; // 백엔드의 roles 배열에 맞춤
}

export interface ResetPasswordData {
  email: string;
  password: string; // newPassword에서 password로 변경
  uuid: string; // UUID 필드 추가
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

// 상담 상태 enum - 백엔드와 일치
export type CounselingStatus = 'OPEN' | 'CLOSE' | 'CANCEL';

// 다가오는 상담 타입 (my-counseling-recent API 응답)
export interface UpcomingCounseling {
  readonly id: number;
  readonly counselor: string;
  readonly time: string; // ISO 8601 형식의 날짜 문자열
  readonly type: string;
  readonly status: CounselingStatus;
}

// 상담 유형 타입 (확장 가능)
export type CounselingType =
  | '학업'
  | '진로'
  | '인간관계'
  | '가족'
  | '정서'
  | '기타';

// 상담 정보 유효성 검사 함수 타입
export type CounselingValidator = (counseling: UpcomingCounseling) => boolean;

// 설문 카테고리 enum (API 문서와 일치)
export type QuestionnaireCategory = '스트레스' | '우울' | '불안' | '자살';

// 설문 결과 타입
export interface QuestionnaireResult {
  category: string;
  score: number;
  createdDate: string; // ISO 8601 형식의 날짜 문자열
}

// 차트 데이터 타입
export interface ChartDataPoint {
  date: string;
  score: number;
  category: string;
}

// 카테고리별 설문 결과 타입
export interface CategoryQuestionnaireResults {
  category: QuestionnaireCategory;
  results: QuestionnaireResult[];
  isLoading: boolean;
  error: string | null;
}
