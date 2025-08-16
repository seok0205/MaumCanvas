/**
 * 토스트 메시지 상수 정의
 * 
 * @description 앱 전반에서 사용되는 토스트 메시지를 중앙화하여 관리
 * 일관된 사용자 경험과 유지보수성을 위해 메시지를 분류하여 정의
 */

export const TOAST_MESSAGES = {
  // 그림 그리기 관련
  DRAWING: {
    // 제출 과정
    SUBMIT_START: "그림을 제출하는 중...",
    SUBMIT_SUCCESS: "그림 제출 완료! AI 분석이 시작됩니다.",
    SUBMIT_PROGRESS: "그림 업로드 중입니다...",
    
    // 업로드 과정
    UPLOAD_START: "파일을 업로드하는 중...",
    UPLOAD_SUCCESS: "파일 업로드 완료! AI 분석이 진행됩니다.",
    UPLOAD_PROGRESS: "파일 처리 중입니다...",
    
    // 저장 과정
    SAVE_SUCCESS: "임시저장이 완료되었습니다.",
    SAVE_ERROR: "임시저장 중 오류가 발생했습니다.",
    
    // 데이터 정리 (백그라운드 작업 - 토스트 없음)
    // DATA_CLEANUP: "그리기 데이터를 정리했습니다.", // 사용하지 않음
  },
  
  // 에러 메시지
  ERRORS: {
    // 제출 관련 에러
    SUBMIT_FAILED: "그림 제출에 실패했습니다.",
    SUBMIT_VALIDATION: "모든 단계의 그림을 완성해주세요.",
    SUBMIT_AUTH: "사용자 인증에 실패했습니다. 다시 로그인해주세요.",
    
    // 업로드 관련 에러
    UPLOAD_FAILED: "파일 업로드에 실패했습니다.",
    UPLOAD_FILE_SIZE: "파일 크기가 너무 큽니다.",
    UPLOAD_FILE_TYPE: "지원하지 않는 파일 형식입니다.",
    
    // 일반 에러
    NETWORK_ERROR: "네트워크 연결을 확인해주세요.",
    UNKNOWN_ERROR: "알 수 없는 오류가 발생했습니다.",
    CANVAS_ERROR: "캔버스를 찾을 수 없습니다.",
  },
  
  // 임시저장 관련
  TEMP_SAVE: {
    SUCCESS: (stepName: string) => `${stepName} 임시저장 완료!`,
    ERROR: "임시저장 중 오류가 발생했습니다.",
    // CLEANUP_SUCCESS: "모든 임시저장 데이터가 삭제되었습니다.", // 사용하지 않음
    // CLEANUP_ERROR: "임시저장 데이터 삭제 중 오류가 발생했습니다.", // 사용하지 않음
  },
  
  // AI 분석 관련
  AI_ANALYSIS: {
    STARTED: "AI 분석이 시작되었습니다.",
    COMPLETED: "AI 분석이 완료되었습니다.",
    FAILED: "AI 분석 중 오류가 발생했습니다.",
  },
} as const;

// 토스트 ID 상수 정의 (중복 방지용)
export const TOAST_IDS = {
  DRAWING_SUBMIT: "drawing-submit",
  DRAWING_UPLOAD: "drawing-upload", 
  DRAWING_SAVE: "drawing-save",
  AI_ANALYSIS: "ai-analysis",
  ERROR_DISPLAY: "error-display",
} as const;

// 토스트 지속 시간 설정
export const TOAST_DURATION = {
  SHORT: 2000,    // 2초
  MEDIUM: 4000,   // 4초 (기본값)
  LONG: 6000,     // 6초
  PERSISTENT: 0,  // 수동으로 닫을 때까지
} as const;

// 타입 정의
export type ToastMessage = typeof TOAST_MESSAGES;
export type ToastId = typeof TOAST_IDS[keyof typeof TOAST_IDS];
export type ToastDuration = typeof TOAST_DURATION[keyof typeof TOAST_DURATION];
