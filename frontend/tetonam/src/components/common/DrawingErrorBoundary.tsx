import type { ReactNode } from 'react';
import { Component } from 'react';

import { Button } from '@/components/ui/interactive/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error?: Error | undefined;
}

/**
 * 태블릿 PWA 환경에서 크래시를 방지하는 에러 바운더리
 * React 18 Concurrent Features와 호환
 */
export class DrawingErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private readonly maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // 에러가 발생하면 폴백 UI를 보여줍니다
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: any) {
    // 에러 로깅 (태블릿 환경에서는 콘솔 로그만)
    console.error('Drawing Error Boundary caught an error:', error, errorInfo);

    // 메모리 부족 에러 감지
    if (this.isMemoryError(error)) {
      this.handleMemoryError();
    }

    // 부모 컴포넌트에 에러 알림
    this.props.onError?.(error, errorInfo);
  }

  /**
   * 메모리 관련 에러인지 확인
   */
  private isMemoryError(error: Error): boolean {
    const memoryErrorPatterns = [
      'out of memory',
      'maximum call stack',
      'script error',
      'network error',
    ];

    const errorMessage = error.message.toLowerCase();
    return memoryErrorPatterns.some(pattern => errorMessage.includes(pattern));
  }

  /**
   * 메모리 에러 처리 - 캐시 정리 및 가비지 컬렉션 유도
   */
  private handleMemoryError(): void {
    try {
      // 로컬 스토리지 일부 정리
      const keys = Object.keys(localStorage);
      const drawingKeys = keys.filter(key => key.startsWith('drawing_'));

      // 오래된 그리기 데이터 삭제 (최근 5개만 유지)
      if (drawingKeys.length > 5) {
        drawingKeys.slice(5).forEach(key => {
          localStorage.removeItem(key);
        });
      }

      // 가비지 컬렉션 유도 (브라우저가 지원하는 경우)
      if ('gc' in window && typeof window.gc === 'function') {
        window.gc();
      }
    } catch (cleanupError) {
      console.warn('Error during memory cleanup:', cleanupError);
    }
  }

  /**
   * 에러 상태 복구 시도
   */
  private handleRetry = (): void => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({ hasError: false, error: undefined });

      // 작은 지연 후 재시도 (렌더링 안정화)
      setTimeout(() => {
        // 추가 정리 작업이 필요한 경우 여기서 수행
      }, 100);
    } else {
      // 최대 재시도 횟수 초과시 페이지 새로고침
      window.location.reload();
    }
  };

  /**
   * 대시보드로 안전한 이동
   */
  private handleGoToDashboard = (): void => {
    try {
      // 현재 그리기 상태 저장 시도
      const currentData = sessionStorage.getItem('currentDrawing');
      if (currentData) {
        localStorage.setItem('backup_drawing', currentData);
      }
    } catch (saveError) {
      console.warn('Failed to save current drawing:', saveError);
    }

    // 대시보드로 이동
    window.location.href = '/dashboard';
  };

  override render() {
    if (this.state.hasError) {
      // 커스텀 폴백이 제공된 경우 사용
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 에러 UI
      return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50 p-4'>
          <div className='max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center'>
            <div className='mb-4'>
              <svg
                className='mx-auto h-12 w-12 text-red-400'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                />
              </svg>
            </div>

            <h2 className='text-xl font-semibold text-gray-900 mb-2'>
              앗! 문제가 발생했습니다
            </h2>

            <p className='text-gray-600 mb-6'>
              그리기 도구에 일시적인 문제가 발생했습니다. 다시 시도하거나
              대시보드로 돌아가세요.
            </p>

            {this.state.error && (
              <details className='mb-4 text-left'>
                <summary className='text-sm text-gray-500 cursor-pointer'>
                  기술적 세부사항
                </summary>
                <pre className='mt-2 text-xs text-gray-400 bg-gray-100 p-2 rounded overflow-auto'>
                  {this.state.error.message}
                </pre>
              </details>
            )}

            <div className='space-y-3'>
              {this.retryCount < this.maxRetries && (
                <Button
                  onClick={this.handleRetry}
                  className='w-full'
                  variant='default'
                >
                  다시 시도 ({this.maxRetries - this.retryCount}회 남음)
                </Button>
              )}

              <Button
                onClick={this.handleGoToDashboard}
                className='w-full'
                variant='outline'
              >
                대시보드로 돌아가기
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook 형태의 에러 바운더리 사용 헬퍼
 */
export const useErrorBoundary = () => {
  const throwError = (error: Error) => {
    throw error;
  };

  return { throwError };
};
