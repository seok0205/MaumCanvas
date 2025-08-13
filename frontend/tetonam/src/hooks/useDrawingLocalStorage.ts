import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { DRAWING_STORAGE } from '@/constants/drawing';
import { AuthenticationError } from '@/types/auth';
import type {
  DrawingCategory,
  DrawingSaveState,
  SavedDrawingData,
  StepSaveStates,
  UseDrawingLocalStorageReturn,
} from '@/types/drawing';

/**
 * 그림 그리기 localStorage 관리 커스텀 훅
 *
 * 기능:
 * - 각 단계별 그림 데이터 저장/로드/삭제
 * - 자동 만료 시간 관리
 * - 저장 상태 추적
 * - 에러 처리 및 폴백
 */
export const useDrawingLocalStorage = (
  userId: string
): UseDrawingLocalStorageReturn => {
  const [saveStates, setSaveStates] = useState<StepSaveStates>({
    HOME: { status: 'unsaved', autoSaveEnabled: true },
    TREE: { status: 'unsaved', autoSaveEnabled: true },
    PERSON1: { status: 'unsaved', autoSaveEnabled: true },
    PERSON2: { status: 'unsaved', autoSaveEnabled: true },
  });

  // localStorage 지원 여부 확인
  const isLocalStorageAvailable = useCallback((): boolean => {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, 'test');
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }, []);

  // 만료된 데이터 정리
  const cleanExpiredData = useCallback(() => {
    if (!isLocalStorageAvailable()) return;

    try {
      const now = Date.now();
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(DRAWING_STORAGE.KEY_PREFIX)) {
          try {
            const data = JSON.parse(
              localStorage.getItem(key) || '{}'
            ) as SavedDrawingData;
            if (now - data.timestamp > DRAWING_STORAGE.EXPIRY_TIME) {
              keysToRemove.push(key);
            }
          } catch {
            // 파싱 실패한 잘못된 데이터도 제거
            keysToRemove.push(key);
          }
        }
        // 압축된 라인 데이터도 정리 (만료 시간은 기본 데이터와 동일하게 적용)
        if (key?.startsWith('DRAWING_COMPRESSED_')) {
          try {
            // 압축된 데이터는 타임스탬프가 없으므로 관련된 기본 데이터가 없으면 제거
            const parts = key.split('_');
            if (parts.length >= 4) {
              const userId = parts[2];
              const stepId = parts[3];
              if (userId && stepId) {
                const relatedKey = DRAWING_STORAGE.KEY_PATTERN(userId, stepId as DrawingCategory);
                if (!localStorage.getItem(relatedKey)) {
                  keysToRemove.push(key);
                }
              }
            }
          } catch {
            keysToRemove.push(key);
          }
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('localStorage cleanup failed:', error);
    }
  }, [isLocalStorageAvailable]);

  // 저장 상태 업데이트
  const updateSaveState = useCallback(
    (stepId: DrawingCategory, state: Partial<DrawingSaveState>) => {
      setSaveStates(prev => ({
        ...prev,
        [stepId]: { ...prev[stepId], ...state },
      }));
    },
    []
  );

  // 그림 저장
  const saveDrawing = useCallback(
    async (stepId: DrawingCategory, dataURL: string): Promise<boolean> => {
      if (!isLocalStorageAvailable()) {
        throw new AuthenticationError(
          'STORAGE_NOT_AVAILABLE',
          'localStorage를 사용할 수 없습니다.'
        );
      }

      updateSaveState(stepId, { status: 'saving' });

      try {
        // 이미지 압축 (품질 조절)
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        return new Promise((resolve, reject) => {
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;

            if (ctx) {
              ctx.drawImage(img, 0, 0);
              const compressedDataURL = canvas.toDataURL(
                DRAWING_STORAGE.IMAGE_FORMAT,
                DRAWING_STORAGE.IMAGE_QUALITY
              );

              const data: SavedDrawingData = {
                dataURL: compressedDataURL,
                timestamp: Date.now(),
                stepId,
                userId,
                quality: DRAWING_STORAGE.IMAGE_QUALITY,
              };

              const key = DRAWING_STORAGE.KEY_PATTERN(userId, stepId);

              try {
                localStorage.setItem(key, JSON.stringify(data));
                updateSaveState(stepId, {
                  status: 'saved',
                  lastSaved: Date.now(),
                });
                resolve(true);
              } catch (storageError) {
                reject(
                  new AuthenticationError(
                    'STORAGE_QUOTA_EXCEEDED',
                    'localStorage 용량이 부족합니다.'
                  )
                );
              }
            } else {
              reject(
                new AuthenticationError(
                  'CANVAS_ERROR',
                  '이미지 압축 중 오류가 발생했습니다.'
                )
              );
            }
          };

          img.onerror = () => {
            reject(
              new AuthenticationError(
                'IMAGE_LOAD_ERROR',
                '이미지 로드 중 오류가 발생했습니다.'
              )
            );
          };

          img.src = dataURL;
        });
      } catch (error) {
        updateSaveState(stepId, { status: 'error' });

        if (error instanceof AuthenticationError) {
          throw error;
        }
        throw new AuthenticationError(
          'SAVE_UNKNOWN_ERROR',
          '저장 중 알 수 없는 오류가 발생했습니다.'
        );
      }
    },
    [userId, isLocalStorageAvailable, updateSaveState]
  );

  // 그림 로드
  const loadDrawing = useCallback(
    (stepId: DrawingCategory): SavedDrawingData | null => {
      if (!isLocalStorageAvailable()) return null;

      try {
        const key = DRAWING_STORAGE.KEY_PATTERN(userId, stepId);
        const stored = localStorage.getItem(key);

        if (!stored) return null;

        const data = JSON.parse(stored) as SavedDrawingData;

        // 만료 확인
        if (Date.now() - data.timestamp > DRAWING_STORAGE.EXPIRY_TIME) {
          localStorage.removeItem(key);
          return null;
        }

        updateSaveState(stepId, {
          status: 'saved',
          lastSaved: data.timestamp,
        });

        return data;
      } catch (error) {
        console.warn(`Failed to load drawing for ${stepId}:`, error);
        return null;
      }
    },
    [userId, isLocalStorageAvailable, updateSaveState]
  );

  // 특정 그림 삭제
  const clearDrawing = useCallback(
    (stepId: DrawingCategory) => {
      if (!isLocalStorageAvailable()) return;

      try {
        // 기본 그림 데이터 삭제
        const key = DRAWING_STORAGE.KEY_PATTERN(userId, stepId);
        localStorage.removeItem(key);
        
        // 압축된 라인 데이터도 삭제
        const compressedKey = `DRAWING_COMPRESSED_${userId}_${stepId}`;
        localStorage.removeItem(compressedKey);
        
        updateSaveState(stepId, { status: 'unsaved' });
      } catch (error) {
        console.warn(`Failed to clear drawing for ${stepId}:`, error);
      }
    },
    [userId, isLocalStorageAvailable, updateSaveState]
  );

  // 모든 그림 삭제
  const clearAllDrawings = useCallback(() => {
    if (!isLocalStorageAvailable()) return;

    try {
      (['HOME', 'TREE', 'PERSON1', 'PERSON2'] as DrawingCategory[]).forEach(
        stepId => {
          // 기본 그림 데이터 삭제
          const key = DRAWING_STORAGE.KEY_PATTERN(userId, stepId);
          localStorage.removeItem(key);
          
          // 압축된 라인 데이터도 삭제
          const compressedKey = `DRAWING_COMPRESSED_${userId}_${stepId}`;
          localStorage.removeItem(compressedKey);
          
          updateSaveState(stepId, { status: 'unsaved' });
        }
      );

      toast.success('모든 임시저장 데이터가 삭제되었습니다.');
    } catch (error) {
      console.warn('Failed to clear all drawings:', error);
      toast.error('임시저장 데이터 삭제 중 오류가 발생했습니다.');
    }
  }, [userId, isLocalStorageAvailable, updateSaveState]);

  // 저장 상태 조회
  const getSaveStates = useCallback((): StepSaveStates => {
    return saveStates;
  }, [saveStates]);

  // 저장되지 않은 변경사항 확인
  const hasUnsavedChanges = useCallback((): boolean => {
    return Object.values(saveStates).some(state => state.status === 'unsaved');
  }, [saveStates]);

  // 저장된 모든 그림 복원
  const restoreFromStorage = useCallback((): Record<
    DrawingCategory,
    string
  > => {
    const restored: Partial<Record<DrawingCategory, string>> = {};

    (['HOME', 'TREE', 'PERSON1', 'PERSON2'] as DrawingCategory[]).forEach(
      stepId => {
        const data = loadDrawing(stepId);
        if (data) {
          restored[stepId] = data.dataURL;
        }
      }
    );

    return restored as Record<DrawingCategory, string>;
  }, [loadDrawing]);

  // 컴포넌트 마운트 시 만료된 데이터 정리
  useEffect(() => {
    cleanExpiredData();
  }, [cleanExpiredData]);

  return {
    saveDrawing,
    loadDrawing,
    clearDrawing,
    clearAllDrawings,
    getSaveStates,
    hasUnsavedChanges,
    restoreFromStorage,
  };
};
