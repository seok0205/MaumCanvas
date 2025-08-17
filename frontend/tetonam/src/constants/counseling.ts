// 상담 예약 관련 상수
export const COUNSELING_CONSTANTS = {
  // 시간 관련
  START_HOUR: 9,
  END_HOUR: 20,
  HOUR_INTERVAL: 1,

  // 날짜 관련
  MAX_DATE_RANGE: 14, // 최대 14일까지 확인
  MAX_DISPLAY_DATES: 7, // 화면에 표시할 최대 날짜 수

  // 캐시 관련
  STALE_TIME: 5 * 60 * 1000, // 5분
  GC_TIME: 10 * 60 * 1000, // 10분

  // 상담 유형
  DEFAULT_COUNSELING_TYPE: '일반상담',
} as const;
