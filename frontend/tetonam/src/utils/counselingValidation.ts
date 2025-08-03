import type { CounselingValidator, UpcomingCounseling } from '@/types/api';

/**
 * 상담 정보의 기본 유효성 검사
 */
export const isValidCounseling: CounselingValidator = counseling => {
  // 필수 필드 존재 확인
  if (!counseling || typeof counseling !== 'object') {
    return false;
  }

  if (
    typeof counseling.id !== 'number' ||
    typeof counseling.counselor !== 'string' ||
    typeof counseling.time !== 'string' ||
    typeof counseling.type !== 'string' ||
    typeof counseling.status !== 'string'
  ) {
    return false;
  }

  // ID가 양수인지 확인
  if (counseling.id <= 0) {
    return false;
  }

  // 상담사 이름이 비어있지 않은지 확인
  if (counseling.counselor.trim().length === 0) {
    return false;
  }

  // 날짜가 유효한 ISO 형식인지 확인
  const date = new Date(counseling.time);
  if (isNaN(date.getTime())) {
    return false;
  }

  // 상담 유형이 비어있지 않은지 확인
  if (counseling.type.trim().length === 0) {
    return false;
  }

  // 상태가 유효한 값인지 확인
  const validStatuses = ['OPEN', 'CLOSE', 'CANCEL'] as const;
  if (!validStatuses.includes(counseling.status as any)) {
    return false;
  }

  return true;
};

/**
 * 날짜 문자열이 유효한지 검사
 */
export const isValidDateString = (dateString: string): boolean => {
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
};

/**
 * 상담 상태가 예정된 상태인지 확인
 */
export const isUpcomingCounseling = (
  counseling: UpcomingCounseling
): boolean => {
  return counseling.status === 'OPEN';
};

/**
 * 상담이 완료된 상태인지 확인
 */
export const isCompletedCounseling = (
  counseling: UpcomingCounseling
): boolean => {
  return counseling.status === 'CLOSE';
};

/**
 * 상담이 취소된 상태인지 확인
 */
export const isCancelledCounseling = (
  counseling: UpcomingCounseling
): boolean => {
  return counseling.status === 'CANCEL';
};

/**
 * 상담 시간이 현재 시간보다 미래인지 확인
 */
export const isFutureCounseling = (counseling: UpcomingCounseling): boolean => {
  try {
    const counselingDate = new Date(counseling.time);
    const now = new Date();
    return counselingDate > now;
  } catch {
    return false;
  }
};

/**
 * 상담 정보를 안전하게 파싱
 */
export const safeParseCounseling = (
  data: unknown
): UpcomingCounseling | null => {
  try {
    if (!isValidCounseling(data as UpcomingCounseling)) {
      return null;
    }
    return data as UpcomingCounseling;
  } catch {
    return null;
  }
};
