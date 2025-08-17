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

// 캔버스 크기 타입 (StageSize와 CanvasSize 통합)
export interface StageSize {
  readonly width: number;
  readonly height: number;
}

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

// ========== 캔버스 그리기 관련 타입 ==========

// 펜 설정 타입
export interface PenSettings {
  pressureSensitivity: boolean;
  touchRejection: boolean;
  tiltSensitivity: boolean;
  pressureMultiplier: number; // 0.1 ~ 2.0
}

// 터치펜 이벤트 데이터 타입
export interface PenEventData {
  pressure: number;
  tiltX: number;
  tiltY: number;
  pointerType: 'mouse' | 'pen' | 'touch';
  pointerId: number;
}

// 그리기 선 데이터 타입
export interface DrawingLine {
  readonly id: number;
  points: number[];
  stroke: string;
  strokeWidth: number;
  globalCompositeOperation: 'source-over' | 'destination-out';
  // 터치펜 관련 확장 데이터
  pointerType?: 'mouse' | 'pen' | 'touch';
  pressureData?: number[]; // 각 포인트별 압력 값
  tiltData?: Array<{ x: number; y: number }>; // 각 포인트별 기울기 값
}

// 그리기 도구 타입
export type DrawingTool = 'pen' | 'eraser';

// 브러시 크기 타입 (요구사항: 연필 1~5, 지우개 5~30 (5단위))
export type BrushSize = 1 | 2 | 3 | 4 | 5 | 10 | 15 | 20 | 25 | 30;

// 색상 타입 (COLOR_PALETTE에서 가져온 색상들)
export type DrawingColor =
  | '#000000'
  | '#FF0000'
  | '#00FF00'
  | '#0000FF'
  | '#FFFF00'
  | '#FF00FF'
  | '#00FFFF'
  | '#FFA500'
  | '#800080'
  | '#FFC0CB'
  | '#A52A2A'
  | '#808080'
  | '#000080'
  | '#008000'
  | '#800000';

// 그리기 단계 데이터 타입
export interface DrawingStep {
  readonly id: DrawingCategory;
  readonly title: string;
  readonly description: string;
  readonly instruction: string;
}

// 각 단계별 선 데이터 타입
export type StepLines = Array<Array<DrawingLine>>;

// Redo 스택 타입
export type RedoStacks = Array<Array<DrawingLine>>;

// 히스토리 타입 (실행취소용)
export type History = Array<Array<DrawingLine>>;

// 저장된 이미지들 타입
export type SavedImages = Record<DrawingCategory, string>;

// 마우스/터치 이벤트 포지션 타입
export interface PointerPosition {
  readonly x: number;
  readonly y: number;
}
