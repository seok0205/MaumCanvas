// Drawing API 엔드포인트 상수
export const DRAWING_ENDPOINTS = {
  // 그림 저장 (4장의 그림 업로드)
  CREATE_DRAWING: '/api/image',
  // 최근 그림 조회
  RECENT_IMAGES: '/api/image/recent-images',
  // 상담의 그림 조회
  COUNSELING_IMAGES: '/api/image/counseling',
  // 상담사 코멘트 RAG
  COUNSELING_RAG: '/api/image/counseling/rag',
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
