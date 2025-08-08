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
  roles: string[]; // 백엔드 SignUpDto와 일치하도록 roles 배열로 수정
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

// JWT 토큰 응답 타입 - 실제 백엔드 응답에 맞춤
export interface JwtTokenResponse {
  grantType: string;
  accessToken: string;
  refreshToken: string;
  refreshTokenExpirationTime: number;
  role: string[]; // 실제 백엔드에서는 role 배열로 제공
}

// 사용자 정보 응답 타입 (마이페이지용)
export interface UserInfoResponse {
  name: string;
  birthday: string;
  phone: string;
  school: string;
  email: string;
  gender: string;
  nickname: string;
  // role 필드 없음 - 마이페이지 표시용이므로 역할 정보 불필요
}

// 메인 화면 사용자 정보 응답 타입 (MainMyInfoResponseDto와 일치)
export interface MainMyInfoResponse {
  readonly name: string;
  readonly nickname: string;
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

// 상담사 정보 검증 함수
export const isValidCounselorInfo = (
  counselor: any
): counselor is CounselorInfo => {
  return (
    counselor &&
    typeof counselor === 'object' &&
    typeof counselor.id === 'number' &&
    counselor.id > 0 &&
    typeof counselor.counselorName === 'string' &&
    counselor.counselorName.trim().length > 0
  );
};

// 상담 예약 요청 타입
export interface CounselingReservationRequest {
  time: string;
  types: string;
  counselorId: number; // 백엔드 DTO와 일치하도록 수정
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

// 백엔드에서 받는 원시 상담 데이터 (LocalDateTime이 배열로 직렬화됨)
export interface RawUpcomingCounseling {
  readonly id: number;
  readonly counselor: string;
  readonly time: number[]; // LocalDateTime이 [년, 월, 일, 시, 분] 배열로 직렬화됨
  readonly type: string;
  readonly status: CounselingStatus;
}

// 다가오는 상담 타입 (프론트엔드에서 사용하는 변환된 형태)
export interface UpcomingCounseling {
  readonly id: number;
  readonly counselor: string;
  readonly time: string; // ISO 8601 형식의 날짜 문자열
  readonly type: string;
  readonly status: CounselingStatus;
}

// 타입 가드 함수들
export const isValidCounselingStatus = (
  status: string
): status is CounselingStatus => {
  return ['OPEN', 'CLOSE', 'CANCEL'].includes(status);
};

// 백엔드 원시 데이터 타입 가드
export const isValidRawUpcomingCounseling = (
  data: unknown
): data is RawUpcomingCounseling => {
  if (!data || typeof data !== 'object') return false;

  const obj = data as Record<string, unknown>;
  return (
    typeof obj['id'] === 'number' &&
    typeof obj['counselor'] === 'string' &&
    Array.isArray(obj['time']) &&
    obj['time'].length >= 5 &&
    obj['time'].every((item: unknown) => typeof item === 'number') &&
    typeof obj['type'] === 'string' &&
    typeof obj['status'] === 'string' &&
    isValidCounselingStatus(obj['status'])
  );
};

// 변환된 프론트엔드 데이터 타입 가드
export const isValidUpcomingCounseling = (
  data: unknown
): data is UpcomingCounseling => {
  if (!data || typeof data !== 'object') return false;

  const obj = data as Record<string, unknown>;
  return (
    typeof obj['id'] === 'number' &&
    typeof obj['counselor'] === 'string' &&
    typeof obj['time'] === 'string' &&
    typeof obj['type'] === 'string' &&
    typeof obj['status'] === 'string' &&
    isValidCounselingStatus(obj['status'])
  );
};

// LocalDateTime 배열을 ISO 8601 문자열로 변환하는 함수 (개선된 버전)
export const convertLocalDateTimeArrayToISO = (timeArray: number[]): string => {
  try {
    if (!Array.isArray(timeArray) || timeArray.length < 5) {
      throw new Error(
        'Invalid time array format - minimum 5 elements required'
      );
    }

    // 배열에서 안전하게 값 추출 (Jackson 형식: [year, month, day, hour, minute, second?, nanosecond?])
    const year = timeArray[0];
    const month = timeArray[1];
    const day = timeArray[2];
    const hour = timeArray[3];
    const minute = timeArray[4];
    const second = timeArray[5] || 0; // 선택적 요소
    const nanosecond = timeArray[6] || 0; // 선택적 요소

    // 값들이 유효한 숫자인지 확인
    if (
      typeof year !== 'number' ||
      typeof month !== 'number' ||
      typeof day !== 'number' ||
      typeof hour !== 'number' ||
      typeof minute !== 'number' ||
      typeof second !== 'number' ||
      typeof nanosecond !== 'number'
    ) {
      throw new Error('Invalid number values in time array');
    }

    // 값 범위 검증
    if (
      year < 1900 ||
      year > 3000 ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31 ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59 ||
      second < 0 ||
      second > 59
    ) {
      throw new Error('Date values out of valid range');
    }

    // UTC 기준으로 Date 생성 (타임존 문제 해결)
    // 백엔드에서 오는 월은 1부터 시작하므로 -1 해야 함
    const millisecond = Math.floor(nanosecond / 1000000); // 나노초를 밀리초로 변환
    const date = new Date(
      Date.UTC(year, month - 1, day, hour, minute, second, millisecond)
    );

    if (isNaN(date.getTime())) {
      throw new Error('Invalid date created from time array');
    }

    return date.toISOString();
  } catch (error) {
    // 실패 시 더 안전한 fallback: 현재 UTC 시간
    const fallbackDate = new Date();
    return fallbackDate.toISOString();
  }
};

// 원시 데이터를 프론트엔드용으로 변환하는 함수
export const transformRawToCounseling = (
  raw: RawUpcomingCounseling
): UpcomingCounseling => {
  return {
    id: raw.id,
    counselor: raw.counselor,
    time: convertLocalDateTimeArrayToISO(raw.time),
    type: raw.type,
    status: raw.status,
  };
};

// 상담 유형 타입 (확장 가능)
export type CounselingType =
  | '학업'
  | '진로'
  | '인간관계'
  | '가족'
  | '정서'
  | '기타';

// === 커뮤니티 관련 타입 (community.ts에서 재export) ===
export type {
  Comment,
  CommentListResponse,
  CommentWriteRequest,
  Community,
  CommunityCategory,
  CursorPaginatedResponse,
  PostListQuery,
  PostListResponse,
  PostSortType,
  PostUpdateRequest,
  PostWriteRequest,
} from './community';

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
