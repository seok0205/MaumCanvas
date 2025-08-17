import { useCounselorCounselingList } from './useCounselingList';
import {
  calculateTotalCount,
  calculateWeeklyCount,
  calculateCounselingStatistics,
} from '@/utils/statisticsUtils';

/**
 * 상담사 총 상담 건수 조회 훅
 * - 부분 구독으로 총 건수가 변경될 때만 리렌더링
 */
export const useCounselorTotalCount = () => {
  return useCounselorCounselingList(calculateTotalCount);
};

/**
 * 상담사 이번 주 상담 건수 조회 훅  
 * - 부분 구독으로 주간 건수가 변경될 때만 리렌더링
 */
export const useCounselorWeeklyCount = () => {
  return useCounselorCounselingList(calculateWeeklyCount);
};

/**
 * 상담사 통계 전체 조회 훅
 * - 모든 통계를 한 번에 계산
 * - 통계 중 하나라도 변경되면 리렌더링
 */
export const useCounselorStatistics = () => {
  return useCounselorCounselingList(calculateCounselingStatistics);
};
