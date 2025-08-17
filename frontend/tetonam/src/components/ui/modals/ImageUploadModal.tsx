import { AlertCircle, Check, Image as ImageIcon, Upload } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Input } from '@/components/ui/forms/input';
import { Button } from '@/components/ui/interactive/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/overlay/dialog';
import { DRAWING_CONFIG } from '@/constants/drawing';
import { TOAST_MESSAGES, TOAST_IDS } from '@/constants/toastMessages';
import { drawingService } from '@/services/drawingService';
import type { HTPImageFiles } from '@/types/drawing';
import { cn } from '@/utils/cn';
import { toastManager } from '@/utils/toastManager';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: string) => void;
}

interface FileUploadState {
  file: File | null;
  preview: string | null;
  error: string | null;
  isValid: boolean;
}

const IMAGE_CATEGORIES = {
  homeImageUrl: {
    title: '집 그림',
    description: '집을 그린 그림을 업로드해주세요',
    placeholder: '집 그림 선택',
  },
  treeImageUrl: {
    title: '나무 그림',
    description: '나무를 그린 그림을 업로드해주세요',
    placeholder: '나무 그림 선택',
  },
  humanImageFirstUrl: {
    title: '사람 그림 (첫 번째)',
    description: '사람을 그린 첫 번째 그림을 업로드해주세요',
    placeholder: '첫 번째 사람 그림 선택',
  },
  humanImageSecondUrl: {
    title: '사람 그림 (두 번째)',
    description: '사람을 그린 두 번째 그림을 업로드해주세요',
    placeholder: '두 번째 사람 그림 선택',
  },
} as const;

export const ImageUploadModal = ({
  isOpen,
  onClose,
  onSuccess,
}: ImageUploadModalProps) => {
  const [fileStates, setFileStates] = useState<
    Record<keyof HTPImageFiles, FileUploadState>
  >({
    homeImageUrl: {
      file: null,
      preview: null,
      error: null,
      isValid: false,
    },
    treeImageUrl: {
      file: null,
      preview: null,
      error: null,
      isValid: false,
    },
    humanImageFirstUrl: {
      file: null,
      preview: null,
      error: null,
      isValid: false,
    },
    humanImageSecondUrl: {
      file: null,
      preview: null,
      error: null,
      isValid: false,
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset } = useForm<HTPImageFiles>();

  // 파일 유효성 검사 함수
  const validateFile = useCallback((file: File): string | null => {
    // 파일 크기 검사
    if (file.size > DRAWING_CONFIG.MAX_FILE_SIZE) {
      return '파일 크기가 10MB를 초과합니다.';
    }

    // 파일 타입 검사
    if (!DRAWING_CONFIG.ALLOWED_FILE_TYPES.includes(file.type as any)) {
      return '지원하지 않는 파일 형식입니다. (JPEG, PNG, GIF만 지원)';
    }

    return null;
  }, []);

  // 파일 미리보기 생성 함수
  const createPreview = useCallback((file: File): Promise<string> => {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  }, []);

  // 파일 변경 핸들러
  const handleFileChange = useCallback(
    async (
      fieldName: keyof HTPImageFiles,
      file: File | null,
      onChange: (file: File | undefined) => void
    ) => {
      if (!file) {
        setFileStates(prev => ({
          ...prev,
          [fieldName]: {
            file: null,
            preview: null,
            error: null,
            isValid: false,
          },
        }));
        onChange(undefined);
        return;
      }

      // 파일 유효성 검사
      const error = validateFile(file);
      if (error) {
        setFileStates(prev => ({
          ...prev,
          [fieldName]: {
            file: null,
            preview: null,
            error,
            isValid: false,
          },
        }));
        onChange(undefined);
        return;
      }

      // 미리보기 생성
      try {
        const preview = await createPreview(file);
        setFileStates(prev => ({
          ...prev,
          [fieldName]: {
            file,
            preview,
            error: null,
            isValid: true,
          },
        }));
        onChange(file);
      } catch (err) {
        setFileStates(prev => ({
          ...prev,
          [fieldName]: {
            file: null,
            preview: null,
            error: '파일 미리보기 생성에 실패했습니다.',
            isValid: false,
          },
        }));
        onChange(undefined);
      }
    },
    [validateFile, createPreview]
  );

  // 모든 파일이 업로드되었는지 확인
  const allFilesUploaded = Object.values(fileStates).every(
    state => state.isValid
  );

  // 폼 제출 핸들러
  const onSubmit = useCallback(
    async (data: HTPImageFiles) => {
      if (!allFilesUploaded) return;

      setIsSubmitting(true);
      try {
        const result = await drawingService.createDrawing(data);
        onSuccess(result);
        reset();
        setFileStates({
          homeImageUrl: {
            file: null,
            preview: null,
            error: null,
            isValid: false,
          },
          treeImageUrl: {
            file: null,
            preview: null,
            error: null,
            isValid: false,
          },
          humanImageFirstUrl: {
            file: null,
            preview: null,
            error: null,
            isValid: false,
          },
          humanImageSecondUrl: {
            file: null,
            preview: null,
            error: null,
            isValid: false,
          },
        });
        onClose();
      } catch (error) {
        console.error('Upload failed:', error);
        
        // 개선된 에러 처리 - 토스트 활성화
        if (error instanceof Error) {
          if (error.message.includes('IMAGE4000')) {
            toastManager.preventDuplicate.error(
              TOAST_MESSAGES.ERRORS.UPLOAD_FILE_TYPE,
              TOAST_IDS.ERROR_DISPLAY,
              { description: '이미지 파일(JPEG, PNG, GIF)만 업로드 가능합니다.' }
            );
          } else if (error.message.includes('IMAGE5000')) {
            toastManager.preventDuplicate.error(
              '이미지 저장에 실패했습니다',
              TOAST_IDS.ERROR_DISPLAY,
              { description: '서버 오류입니다. 잠시 후 다시 시도해주세요.' }
            );
          } else {
            toastManager.preventDuplicate.error(
              error.message || TOAST_MESSAGES.ERRORS.UPLOAD_FAILED,
              TOAST_IDS.ERROR_DISPLAY
            );
          }
        } else {
          toastManager.preventDuplicate.error(
            TOAST_MESSAGES.ERRORS.UPLOAD_FAILED,
            TOAST_IDS.ERROR_DISPLAY,
            { description: '다시 시도해주세요.' }
          );
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [allFilesUploaded, onSuccess, reset, onClose]
  ) as (data: HTPImageFiles) => Promise<void>;

  // 모달 닫기 핸들러
  const handleClose = useCallback(() => {
    if (isSubmitting) return; // 업로드 중일 때는 닫기 방지
    reset();
    setFileStates({
      homeImageUrl: {
        file: null,
        preview: null,
        error: null,
        isValid: false,
      },
      treeImageUrl: {
        file: null,
        preview: null,
        error: null,
        isValid: false,
      },
      humanImageFirstUrl: {
        file: null,
        preview: null,
        error: null,
        isValid: false,
      },
      humanImageSecondUrl: {
        file: null,
        preview: null,
        error: null,
        isValid: false,
      },
    });
    onClose();
  }, [isSubmitting, reset, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className='max-w-4xl max-h-[90vh] overflow-y-auto'
        onPointerDownOutside={e => {
          if (isSubmitting) {
            e.preventDefault(); // 업로드 중일 때 모달 밖 클릭 방지
          }
        }}
        onEscapeKeyDown={e => {
          if (isSubmitting) {
            e.preventDefault(); // 업로드 중일 때 ESC 키 방지
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold text-gray-900'>
            HTP 검사 그림 업로드
          </DialogTitle>
          <DialogDescription className='text-gray-600'>
            집(House), 나무(Tree), 사람(Person) 그림을 각각 업로드해주세요. 모든
            그림을 업로드해야 검사가 진행됩니다.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          {/* 파일 업로드 섹션들 */}
          <div className='grid gap-6 md:grid-cols-2'>
            {Object.entries(IMAGE_CATEGORIES).map(([fieldName, category]) => (
              <div
                key={fieldName}
                className='space-y-4 p-4 border border-gray-200 rounded-lg'
              >
                <div className='flex items-center gap-2'>
                  <ImageIcon className='w-5 h-5 text-primary' />
                  <h3 className='font-semibold text-gray-900'>
                    {category.title}
                  </h3>
                  {fileStates[fieldName as keyof HTPImageFiles].isValid && (
                    <Check className='w-4 h-4 text-green-500' />
                  )}
                </div>

                <p className='text-sm text-gray-600'>{category.description}</p>

                <Controller
                  name={fieldName as keyof HTPImageFiles}
                  control={control}
                  rules={{
                    required: '이 파일은 필수입니다.',
                  }}
                  render={({ field: { onChange }, fieldState: { error } }) => (
                    <div className='space-y-2'>
                      <Input
                        type='file'
                        accept={DRAWING_CONFIG.ALLOWED_FILE_TYPES.join(',')}
                        onChange={e => {
                          const file = e.target.files?.[0] || null;
                          handleFileChange(
                            fieldName as keyof HTPImageFiles,
                            file,
                            onChange
                          );
                        }}
                        disabled={isSubmitting}
                        className={cn(
                          'cursor-pointer',
                          fileStates[fieldName as keyof HTPImageFiles].error &&
                            'border-red-500',
                          fileStates[fieldName as keyof HTPImageFiles]
                            .isValid && 'border-green-500'
                        )}
                      />

                      {/* 에러 메시지 */}
                      {(fileStates[fieldName as keyof HTPImageFiles].error ||
                        error) && (
                        <div className='flex items-center gap-1 text-sm text-red-600'>
                          <AlertCircle className='w-4 h-4' />
                          <span>
                            {fileStates[fieldName as keyof HTPImageFiles]
                              .error || error?.message}
                          </span>
                        </div>
                      )}

                      {/* 미리보기 */}
                      {fileStates[fieldName as keyof HTPImageFiles].preview && (
                        <div className='mt-2'>
                          <img
                            src={
                              fileStates[fieldName as keyof HTPImageFiles]
                                .preview!
                            }
                            alt={`${category.title} 미리보기`}
                            className='w-full h-32 object-cover rounded-lg border border-gray-200'
                          />
                        </div>
                      )}
                    </div>
                  )}
                />
              </div>
            ))}
          </div>

          {/* 파일 정보 안내 */}
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
            <h4 className='font-medium text-blue-900 mb-2'>업로드 안내사항</h4>
            <ul className='text-sm text-blue-800 space-y-1'>
              <li>• 지원 형식: JPEG, PNG, GIF</li>
              <li>• 최대 파일 크기: 10MB</li>
              <li>• 모든 4개의 그림이 업로드되어야 합니다</li>
              <li>• 업로드 중에는 모달창이 닫히지 않습니다</li>
            </ul>
          </div>

          {/* 진행 상태 표시 */}
          <div className='bg-gray-50 rounded-lg p-4'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-sm font-medium text-gray-700'>
                업로드 진행 상태
              </span>
              <span className='text-sm text-gray-600'>
                {
                  Object.values(fileStates).filter(state => state.isValid)
                    .length
                }{' '}
                / 4
              </span>
            </div>
            <div className='w-full bg-gray-200 rounded-full h-2'>
              <div
                className='bg-primary h-2 rounded-full transition-all duration-300'
                style={{
                  width: `${
                    (Object.values(fileStates).filter(state => state.isValid)
                      .length /
                      4) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>

          {/* 버튼 영역 */}
          <div className='flex gap-3 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              disabled={isSubmitting}
              className='flex-1'
            >
              취소
            </Button>
            <Button
              type='submit'
              disabled={!allFilesUploaded || isSubmitting}
              className='flex-1'
            >
              {isSubmitting ? (
                <div className='flex items-center gap-2'>
                  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                  업로드 중...
                </div>
              ) : (
                <div className='flex items-center gap-2'>
                  <Upload className='w-4 h-4' />
                  업로드
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
