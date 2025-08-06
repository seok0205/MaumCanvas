export interface QuestionnaireOption {
  text: string;
  score: number;
}

export interface QuestionnaireQuestion {
  id: number;
  text: string;
  options: QuestionnaireOption[];
}

export interface QuestionnaireCategory {
  id: string;
  title: string;
  description: string;
  questions: QuestionnaireQuestion[];
  maxScore: number;
  resultLevels: QuestionnaireResultLevel[];
}

export interface QuestionnaireResultLevel {
  minScore: number;
  maxScore: number;
  level: string;
  description: string;
  recommendation?: string;
}

export interface QuestionnaireResponse {
  questionId: number;
  selectedScore: number;
}

export interface QuestionnaireSubmission {
  category: string; // 백엔드 쿼리 파라미터로 전송
  score: number; // 백엔드 쿼리 파라미터로 전송
  responses: QuestionnaireResponse[]; // 프론트엔드에서만 사용 (백엔드 전송 X)
}

export interface QuestionnaireResult {
  category: string;
  score: number;
  level: QuestionnaireResultLevel;
  responses: QuestionnaireResponse[];
  submittedAt: Date;
}

export type QuestionnaireType =
  | 'ptsd'
  | 'depression'
  | 'anxiety'
  | 'suicide-risk';
