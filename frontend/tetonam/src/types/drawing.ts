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
