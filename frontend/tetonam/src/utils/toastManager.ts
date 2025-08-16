import { toast } from 'sonner';
import { TOAST_DURATION, type ToastId, type ToastDuration } from '@/constants/toastMessages';

/**
 * 토스트 관리 유틸리티
 * 
 * @description 앱 전반의 토스트 표시를 일관되게 관리하고 중복을 방지하는 유틸리티
 * 프로그레시브 토스트, 중복 방지, 타이밍 조절 등의 기능을 제공
 */

interface ToastOptions {
  duration?: ToastDuration;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ProgressiveToastOptions extends ToastOptions {
  id: ToastId;
}

class ToastManager {
  // 현재 활성 토스트 추적
  private activeToasts = new Set<string>();
  
  /**
   * 이전 토스트를 정리하고 새로운 토스트 표시
   */
  private cleanupAndShow = (
    showFn: () => string | number, 
    id: string
  ): string | number => {
    this.dismissPrevious(id);
    const toastId = showFn();
    this.activeToasts.add(id);
    return toastId;
  };

  /**
   * 이전 토스트 닫기
   */
  dismissPrevious = (id: string): void => {
    if (this.activeToasts.has(id)) {
      toast.dismiss(id);
      this.activeToasts.delete(id);
    }
  };

  /**
   * 모든 토스트 닫기
   */
  dismissAll = (): void => {
    toast.dismiss();
    this.activeToasts.clear();
  };

  /**
   * 프로그레시브 토스트 - 단계별로 업데이트되는 토스트
   */
  progressive = {
    /**
     * 로딩 시작
     */
    start: (message: string, options: ProgressiveToastOptions): string | number => {
      return this.cleanupAndShow(() => {
        return toast.loading(message, {
          id: options.id,
          duration: options.duration || TOAST_DURATION.PERSISTENT,
          description: options.description,
        });
      }, options.id);
    },

    /**
     * 성공으로 업데이트
     */
    success: (message: string, options: ProgressiveToastOptions): string | number => {
      return toast.success(message, {
        id: options.id,
        duration: options.duration || TOAST_DURATION.MEDIUM,
        description: options.description,
        action: options.action,
      });
    },

    /**
     * 에러로 업데이트
     */
    error: (message: string, options: ProgressiveToastOptions): string | number => {
      return toast.error(message, {
        id: options.id,
        duration: options.duration || TOAST_DURATION.LONG,
        description: options.description,
        action: options.action,
      });
    },

    /**
     * 정보로 업데이트
     */
    info: (message: string, options: ProgressiveToastOptions): string | number => {
      return toast.info(message, {
        id: options.id,
        duration: options.duration || TOAST_DURATION.MEDIUM,
        description: options.description,
      });
    },
  };

  /**
   * 중복 방지 토스트 - 같은 ID의 토스트가 이미 있으면 교체
   */
  preventDuplicate = {
    success: (message: string, id: ToastId, options?: ToastOptions): string | number => {
      return this.cleanupAndShow(() => {
        return toast.success(message, {
          id,
          duration: options?.duration || TOAST_DURATION.MEDIUM,
          description: options?.description,
          action: options?.action,
        });
      }, id);
    },

    error: (message: string, id: ToastId, options?: ToastOptions): string | number => {
      return this.cleanupAndShow(() => {
        return toast.error(message, {
          id,
          duration: options?.duration || TOAST_DURATION.LONG,
          description: options?.description,
          action: options?.action,
        });
      }, id);
    },

    info: (message: string, id: ToastId, options?: ToastOptions): string | number => {
      return this.cleanupAndShow(() => {
        return toast.info(message, {
          id,
          duration: options?.duration || TOAST_DURATION.MEDIUM,
          description: options?.description,
        });
      }, id);
    },

    loading: (message: string, id: ToastId, options?: ToastOptions): string | number => {
      return this.cleanupAndShow(() => {
        return toast.loading(message, {
          id,
          duration: options?.duration || TOAST_DURATION.PERSISTENT,
          description: options?.description,
        });
      }, id);
    },
  };

  /**
   * 지연된 토스트 표시 (이전 토스트가 끝난 후)
   */
  delayed = {
    success: (
      message: string, 
      delay: number = 500, 
      options?: ToastOptions
    ): Promise<string | number> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(toast.success(message, {
            duration: options?.duration || TOAST_DURATION.MEDIUM,
            description: options?.description,
            action: options?.action,
          }));
        }, delay);
      });
    },

    error: (
      message: string, 
      delay: number = 500, 
      options?: ToastOptions
    ): Promise<string | number> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(toast.error(message, {
            duration: options?.duration || TOAST_DURATION.LONG,
            description: options?.description,
            action: options?.action,
          }));
        }, delay);
      });
    },
  };

  /**
   * 조건부 토스트 - 특정 조건에서만 표시
   */
  conditional = {
    showOnError: (
      condition: boolean,
      message: string,
      options?: ToastOptions
    ): string | number | null => {
      if (condition) {
        return toast.error(message, {
          duration: options?.duration || TOAST_DURATION.LONG,
          description: options?.description,
          action: options?.action,
        });
      }
      return null;
    },

    showOnSuccess: (
      condition: boolean,
      message: string,
      options?: ToastOptions
    ): string | number | null => {
      if (condition) {
        return toast.success(message, {
          duration: options?.duration || TOAST_DURATION.MEDIUM,
          description: options?.description,
          action: options?.action,
        });
      }
      return null;
    },
  };

  /**
   * 현재 활성 토스트 수 반환
   */
  getActiveCount = (): number => {
    return this.activeToasts.size;
  };

  /**
   * 특정 토스트가 활성 상태인지 확인
   */
  isActive = (id: string): boolean => {
    return this.activeToasts.has(id);
  };
}

// 싱글톤 인스턴스 생성 및 export
export const toastManager = new ToastManager();

// 편의를 위한 직접 접근 함수들
export const showProgressiveToast = toastManager.progressive;
export const showUniqueToast = toastManager.preventDuplicate;
export const showDelayedToast = toastManager.delayed;
export const showConditionalToast = toastManager.conditional;

// 타입 export
export type { ToastOptions, ProgressiveToastOptions };
