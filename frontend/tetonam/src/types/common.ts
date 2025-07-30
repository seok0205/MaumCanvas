// 비동기 상태 관리 타입
export interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// 폼 관련 타입
export interface FormValidationError {
  field: string;
  message: string;
}
