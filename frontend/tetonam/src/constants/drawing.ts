// const BASE_URL = 'https://i13e108.p.ssafy.io';

// Drawing API 엔드포인트 상수
export const DRAWING_ENDPOINTS = {
  // 그림 저장 (4장의 그림 업로드)
  CREATE_DRAWING: '/api/image',
  // CREATE_DRAWING: `${BASE_URL}/api/image`,
  // 최근 그림 조회
  RECENT_IMAGES: '/api/image/recent-images',
  // RECENT_IMAGES: `${BASE_URL}/api/image/recent-images`,
  // 상담의 그림 조회
  COUNSELING_IMAGES: '/api/image/counseling',
  // COUNSELING_IMAGES: `${BASE_URL}/api/image/counseling`,
  // 상담사 코멘트 RAG
  COUNSELING_RAG: '/api/image/counseling/rag',
  // COUNSELING_RAG: `${BASE_URL}/api/image/counseling/rag`,
} as const;

// Drawing 관련 에러 코드
export const DRAWING_ERROR_CODES = {
  // 그림 업로드 관련
  DRAWING_UPLOAD_FAILED: 'DRAWING_UPLOAD_FAILED',
  DRAWING_UPLOAD_ERROR: 'DRAWING_UPLOAD_ERROR',

  // 그림 조회 관련
  RECENT_IMAGES_FETCH_FAILED: 'RECENT_IMAGES_FETCH_FAILED',
  RECENT_IMAGES_FETCH_ERROR: 'RECENT_IMAGES_FETCH_ERROR',
  COUNSELING_IMAGES_FETCH_FAILED: 'COUNSELING_IMAGES_FETCH_FAILED',
  COUNSELING_IMAGES_FETCH_ERROR: 'COUNSELING_IMAGES_FETCH_ERROR',

  // RAG 저장 관련
  COUNSELING_RAG_SAVE_FAILED: 'COUNSELING_RAG_SAVE_FAILED',
  COUNSELING_RAG_SAVE_ERROR: 'COUNSELING_RAG_SAVE_ERROR',

  // 파일 유효성 검사 관련
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  MISSING_FILE: 'MISSING_FILE',
  VALIDATION_FAILED: 'VALIDATION_FAILED',

  // 공통 에러
  NETWORK_ERROR: 'NETWORK_ERROR',
  ABORTED: 'ABORTED',
} as const;

// Drawing 관련 설정 상수
export const DRAWING_CONFIG = {
  // 파일 크기 제한 (10MB)
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  // 허용되는 파일 타입
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  // HTP 검사 이미지 종류
  HTP_IMAGE_TYPES: {
    HOME: 'homeImageUrl',
    TREE: 'treeImageUrl',
    HUMAN_FIRST: 'humanImageFirstUrl',
    HUMAN_SECOND: 'humanImageSecondUrl',
  },
} as const;

// localStorage 관련 상수
export const DRAWING_STORAGE = {
  // localStorage 키 패턴
  KEY_PREFIX: 'drawing',
  KEY_PATTERN: (userId: string, stepId: string) =>
    `drawing_${userId}_${stepId}`,

  // 자동저장 설정
  AUTO_SAVE_DELAY: 30000, // 30초

  // 데이터 만료 시간
  EXPIRY_TIME: 24 * 60 * 60 * 1000, // 24시간

  // 이미지 품질 설정
  IMAGE_QUALITY: 0.8, // localStorage 용량 최적화
  IMAGE_FORMAT: 'image/jpeg' as const, // JPEG가 PNG보다 용량 작음
} as const;

// 저장 상태 타입
export const SAVE_STATUS = {
  SAVED: 'saved',
  UNSAVED: 'unsaved',
  SAVING: 'saving',
  ERROR: 'error',
} as const;

export type SaveStatus = (typeof SAVE_STATUS)[keyof typeof SAVE_STATUS];

// ========== 캔버스 관련 상수 ==========

// 캔버스 설정 상수
export const CANVAS_CONFIG = {
  WIDTH: 800,
  HEIGHT: 600,
  DEFAULT_BRUSH_SIZE: 5,
  MIN_BRUSH_SIZE: 1,
  MAX_BRUSH_SIZE: 20,
  IMAGE_QUALITY: 1.0,
  PIXEL_RATIO: 2,
} as const;

// 기본 색상 팔레트
export const COLOR_PALETTE = [
  '#000000',
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#FF00FF',
  '#00FFFF',
  '#FFA500',
  '#800080',
  '#FFC0CB',
  '#A52A2A',
  '#808080',
  '#000080',
  '#008000',
  '#800000',
] as const;

// 그림 그리기 단계 정의
export const DRAWING_STEPS = [
  {
    id: 'HOME',
    title: '집 그리기',
    description: '편안하고 안전한 공간인 집을 자유롭게 그려보세요.',
    instruction:
      '집의 모습을 상상하며 자유롭게 표현해주세요. 크기나 형태에 제한이 없습니다.',
  },
  {
    id: 'TREE',
    title: '나무 그리기',
    description: '생명력과 성장을 상징하는 나무를 그려보세요.',
    instruction:
      '어떤 나무든 상관없습니다. 마음에 떠오르는 나무의 모습을 그려주세요.',
  },
  {
    id: 'PERSON1',
    title: '사람 그리기 (첫 번째)',
    description: '첫 번째 사람을 그려보세요.',
    instruction:
      '어떤 사람이든 좋습니다. 자신일 수도, 다른 사람일 수도 있어요.',
  },
  {
    id: 'PERSON2',
    title: '사람 그리기 (두 번째)',
    description: '두 번째 사람을 그려보세요.',
    instruction:
      '첫 번째와 다른 사람을 그려보세요. 관계나 상황을 자유롭게 표현하세요.',
  },
] as const;

// 브러시 도구 설정 (연필/볼펜 정도의 두께만 제공)
export const BRUSH_SIZES = [2, 5] as const;
