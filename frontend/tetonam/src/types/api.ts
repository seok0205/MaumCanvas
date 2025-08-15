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

// API 에러 타입 정의
export type ApiErrorType = 'UNAUTHORIZED' | 'NOT_FOUND' | 'NETWORK' | 'UNKNOWN' | 'RAG_NOT_READY';

export interface ApiResult<T> {
  data: T | null;
  error?: ApiErrorType;
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
  readonly id?: number; // 백엔드가 id로 줄 수도 있음
  readonly userId?: number; // 또는 userId로 줄 수도 있음
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
  readonly name: string; // 역할에 따라 상대방 이름(학생/상담사)
  // 백엔드(LocalDateTime) 직렬화가 ISO 문자열 또는 숫자 배열(년,월,일,시,분,...)일 수 있으므로 유니온 허용
  readonly time: number[] | string;
  readonly type: string;
  readonly status: CounselingStatus;
}

// 다가오는 상담 타입 (프론트엔드에서 사용하는 변환된 형태)
export interface UpcomingCounseling {
  readonly id: number;
  readonly name: string; // 역할에 따라 상대방 이름(학생/상담사)
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
  const time = obj['time'];
  const isArrayTime =
    Array.isArray(time) &&
    (time as unknown[]).length >= 5 &&
    (time as unknown[]).every((item: unknown) => typeof item === 'number');
  const isStringTime = typeof time === 'string' && (time as string).length > 0;

  return (
    typeof obj['id'] === 'number' &&
    typeof obj['name'] === 'string' &&
    (isArrayTime || isStringTime) &&
    typeof obj['type'] === 'string' &&
    typeof obj['status'] === 'string' &&
    isValidCounselingStatus(obj['status'] as string)
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
    typeof obj['name'] === 'string' &&
    typeof obj['time'] === 'string' &&
    typeof obj['type'] === 'string' &&
    typeof obj['status'] === 'string' &&
    isValidCounselingStatus(obj['status'])
  );
};

// LocalDateTime 배열을 ISO 8601 문자열로 변환하는 함수 (개선된 버전)
export const convertLocalDateTimeArrayToISO = (timeArray: number[]): string => {
  // NOTE: 기존 구현은 UTC(Date.UTC) 기준으로 ISO 문자열을 생성한 뒤
  // 프론트에서 다시 Date 로 파싱하면서 현지 시간대(+09:00) 보정이 적용되어
  // 실제 예약 시간이 9시간 뒤(예: 09:00 -> 18:00)로 표시되는 문제가 있었습니다.
  // 해결: 서버(LocalDateTime)가 의미하는 “현지 시간” 그대로를 표현하기 위해
  // Z(UTC) 접미사를 붙이지 않은 로컬 형식의 ISO 유사 문자열(YYYY-MM-DDTHH:mm:ss)을 반환합니다.
  // 이렇게 하면 new Date(string) 파싱 시 로컬 타임존으로 해석되어 시간 왜곡이 사라집니다.
  try {
    if (!Array.isArray(timeArray) || timeArray.length < 5) {
      throw new Error(
        'Invalid time array format - minimum 5 elements required'
      );
    }

    // 기본값을 주어 타입 단언 (이미 length >=5 검증됨)
    const [yearRaw, monthRaw, dayRaw, hourRaw, minuteRaw] = timeArray;
    const secondRaw = timeArray[5] ?? 0;
    const nanosecondRaw = timeArray[6] ?? 0; // 보존 용도

    const year = yearRaw as number;
    const month = monthRaw as number;
    const day = dayRaw as number;
    const hour = hourRaw as number;
    const minute = minuteRaw as number;
    const second = secondRaw as number;
    const nanosecond = nanosecondRaw as number;

    // 값 타입 및 범위 검증
    const isNumber = (v: unknown): v is number =>
      typeof v === 'number' && !isNaN(v);
    if (![year, month, day, hour, minute, second, nanosecond].every(isNumber)) {
      throw new Error('Invalid number values in time array');
    }
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

    const pad = (n: number) => n.toString().padStart(2, '0');
    // 로컬(타임존 미지정) ISO 유사 포맷. 초 이하 정밀도는 현재 사용하지 않아 생략.
    // 예: 2025-08-12T09:00:00
    return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:${pad(second)}`;
  } catch {
    // 실패 시에도 기존 로직과 유사하게 안전한 fallback
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }
};

// 원시 데이터를 프론트엔드용으로 변환하는 함수
export const transformRawToCounseling = (
  raw: RawUpcomingCounseling
): UpcomingCounseling => {
  const timeISO = Array.isArray(raw.time)
    ? convertLocalDateTimeArrayToISO(raw.time)
    : ((): string => {
        // 문자열이면 ISO 8601로 가정하고 그대로 사용. 필요 시 간단 검증/정규화
        const s = raw.time as string;
        return s && s.trim().length > 0
          ? s
          : convertLocalDateTimeArrayToISO([] as unknown as number[]);
      })();

  return {
    id: raw.id,
    name: raw.name,
    time: timeISO,
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
