import { isThisWeek, parseISO } from 'date-fns';
import type { CounselingHistory } from '@/types/api';

/**
 * 상담 내역이 이번 주에 속하는지 확인
 * @param counseling 상담 내역 객체
 * @returns 이번 주 상담 여부
 */
export const isCounselingThisWeek = (counseling: CounselingHistory): boolean => {
  try {
    const counselingDate = parseISO(counseling.time);
    return isThisWeek(counselingDate);
  } catch {
    return false;
  }
};

/**
 * 총 상담자 수 계산 (중복 제거)
 * @param counselingList 상담 내역 배열
 * @returns 중복 제거된 상담자 수
 */
export const calculateTotalCount = (counselingList: CounselingHistory[]): number => {
  const uniqueCounselors = new Set(counselingList.map(counseling => counseling.counselor));
  return uniqueCounselors.size;
};

/**
 * 이번 주 상담 건수 계산
 * @param counselingList 상담 내역 배열
 * @returns 이번 주 상담 건수
 */
export const calculateWeeklyCount = (counselingList: CounselingHistory[]): number => {
  return counselingList.filter(isCounselingThisWeek).length;
};

/**
 * 상담 통계 전체 계산
 * @param counselingList 상담 내역 배열
 * @returns 통계 객체
 */
export const calculateCounselingStatistics = (counselingList: CounselingHistory[]) => {
  return {
    totalCounselors: calculateTotalCount(counselingList),
    weeklyCounselings: calculateWeeklyCount(counselingList),
  };
};
