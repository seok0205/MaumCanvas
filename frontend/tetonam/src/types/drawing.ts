// Drawing 관련 타입 정의
export interface RecentDrawingResponse {
  readonly id: number;
  category: string;
  imageUrl: string;
}

// HTP 검사 이미지 업로드 타입
export interface HTPImageFiles {
  homeImageUrl: File;
  treeImageUrl: File;
  humanImageFirstUrl: File;
  humanImageSecondUrl: File;
}

// 상담사 RAG 코멘트 요청 타입
export interface CounselingRagRequest {
  comment: string;
}

// Drawing API 응답 타입들
export type CreateDrawingResponse = string;
export type RecentDrawingsResponse = RecentDrawingResponse[];
export type CounselingImagesResponse = RecentDrawingResponse[];
export type CounselingRagResponse = string;

// Drawing 카테고리 타입 (백엔드의 DrawingCategory enum에 정확히 맞춤)
export type DrawingCategory = 'HOME' | 'TREE' | 'PERSON1' | 'PERSON2';

// localStorage 저장 데이터 타입
export interface SavedDrawingData {
  readonly dataURL: string;
  readonly timestamp: number;
  readonly stepId: DrawingCategory;
  readonly userId: string;
  readonly quality: number;
}

// 저장 상태 관리 타입
export interface DrawingSaveState {
  readonly status: 'saved' | 'unsaved' | 'saving' | 'error';
  readonly lastSaved?: number;
  readonly autoSaveEnabled: boolean;
}

// 각 단계별 저장 상태
export type StepSaveStates = Record<DrawingCategory, DrawingSaveState>;

// localStorage 관리 훅 반환 타입
export interface UseDrawingLocalStorageReturn {
  saveDrawing: (stepId: DrawingCategory, dataURL: string) => Promise<boolean>;
  loadDrawing: (stepId: DrawingCategory) => SavedDrawingData | null;
  clearDrawing: (stepId: DrawingCategory) => void;
  clearAllDrawings: () => void;
  getSaveStates: () => StepSaveStates;
  hasUnsavedChanges: () => boolean;
  restoreFromStorage: () => Record<DrawingCategory, string>;
}
