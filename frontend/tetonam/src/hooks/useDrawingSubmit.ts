import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { CANVAS_CONFIG, DRAWING_STEPS } from '@/constants/drawing';
import { useDrawingLocalStorage } from '@/hooks/useDrawingLocalStorage';
import { drawingService } from '@/services/drawingService';
import { useAuthStore } from '@/stores/useAuthStore';
import { useDrawingStore } from '@/stores/useDrawingStore';
import { AuthenticationError } from '@/types/auth';
import type { DrawingCategory, HTPImageFiles } from '@/types/drawing';

/**
 * 그림 제출 관련 로직을 관리하는 커스텀 훅
 * 
 * @param stageRef - Konva Stage 참조
 * @returns 제출 관련 함수들과 상태
 */
export const useDrawingSubmit = (stageRef: React.RefObject<any>) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    currentStep,
    stepsLines,
    savedImages,
    isSubmitting,
    setIsSubmitting,
    resetDrawingState,
  } = useDrawingStore();

  const { clearAllDrawings } = useDrawingLocalStorage(user?.id || '');

  // 캔버스를 이미지로 변환 (React.useCallback으로 안정적인 참조 유지)
  const canvasToFile = useCallback(
    (dataURL: string, fileName: string): File => {
      const arr = dataURL.split(',');
      const mimeMatch = arr[0]?.match(/:(.*?);/);
      if (!mimeMatch || !arr[1]) {
        throw new Error('Invalid data URL format');
      }

      const mime = mimeMatch[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      return new File([u8arr], fileName, { type: mime || 'image/png' });
    },
    [] // 의존성 없음 - 순수 함수
  );

  // 최종 제출 (React 공식 문서 권장사항: 의존성 배열 명시적 관리)
  const handleSubmit = useCallback(async () => {
    // 가드 클로즈 패턴으로 조기 검증
    if (!stageRef.current) {
      toast.error('캔버스를 찾을 수 없습니다.');
      return;
    }

    if (!user?.id) {
      toast.error('사용자 정보를 찾을 수 없습니다. 로그인을 확인해주세요.');
      return;
    }

    // 모든 단계가 완료되었는지 확인 (타입 안전성)
    const hasEmptyStep = stepsLines.some(
      (lines: readonly any[]) => lines.length === 0
    );
    if (hasEmptyStep) {
      toast.error('모든 단계의 그림을 완성해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const files: Partial<HTPImageFiles> = {};

      // 각 단계별로 이미지 생성 (최적화된 루프)
      for (let i = 0; i < DRAWING_STEPS.length; i++) {
        const stepData = DRAWING_STEPS[i];
        if (!stepData) continue;

        const stepId = stepData.id as DrawingCategory;

        // 현재 단계가 아닌 경우 저장된 이미지 사용
        if (i !== currentStep) {
          if (savedImages[stepId]) {
            const fileName = `${stepId.toLowerCase()}_image.png`;
            const file = canvasToFile(savedImages[stepId], fileName);

            // 타입 안전한 할당
            switch (stepId) {
              case 'HOME':
                files.homeImageUrl = file;
                break;
              case 'TREE':
                files.treeImageUrl = file;
                break;
              case 'PERSON1':
                files.humanImageFirstUrl = file;
                break;
              case 'PERSON2':
                files.humanImageSecondUrl = file;
                break;
            }
          }
        } else {
          // 현재 단계는 실시간으로 캔버스에서 가져오기
          const dataURL = stageRef.current.toDataURL({
            mimeType: 'image/png',
            quality: CANVAS_CONFIG.IMAGE_QUALITY,
            pixelRatio: CANVAS_CONFIG.PIXEL_RATIO,
          });

          const fileName = `${stepId.toLowerCase()}_image.png`;
          const file = canvasToFile(dataURL, fileName);

          // 타입 안전한 할당
          switch (stepId) {
            case 'HOME':
              files.homeImageUrl = file;
              break;
            case 'TREE':
              files.treeImageUrl = file;
              break;
            case 'PERSON1':
              files.humanImageFirstUrl = file;
              break;
            case 'PERSON2':
              files.humanImageSecondUrl = file;
              break;
          }
        }
      }

      // 필수 파일들이 모두 있는지 확인 (타입 가드)
      if (
        !files.homeImageUrl ||
        !files.treeImageUrl ||
        !files.humanImageFirstUrl ||
        !files.humanImageSecondUrl
      ) {
        throw new AuthenticationError(
          'DRAWING4000',
          '일부 그림이 누락되었습니다.'
        );
      }

      // API 호출
      await drawingService.createDrawing(files as HTPImageFiles);

      toast.success('그림이 성공적으로 제출되었습니다!', {
        description: 'AI 분석이 시작됩니다. 잠시만 기다려주세요.',
      });

      // 제출 성공 후 모든 데이터 정리 (순서 중요)
      clearAllDrawings(); // localStorage에서 모든 임시저장 데이터 삭제
      resetDrawingState(); // 앱 상태 초기화

      // 결과 페이지로 이동
      navigate('/diagnosis/drawing');
    } catch (error) {
      console.error('Submit error:', error);

      // 타입 안전한 에러 처리
      if (error instanceof AuthenticationError) {
        toast.error(error.message);
      } else {
        // 일반적인 에러 처리
        toast.error('그림 제출 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    // React 공식 문서: 모든 반응형 값은 의존성 배열에 포함되어야 함
    stageRef,
    user?.id,
    stepsLines,
    currentStep,
    savedImages,
    canvasToFile,
    navigate,
    clearAllDrawings,
    resetDrawingState,
    setIsSubmitting,
  ]);

  // Named export로 안정적인 API 제공
  return {
    isSubmitting,
    handleSubmit,
    canvasToFile, // 외부에서도 사용 가능한 유틸리티 함수
  } as const; // readonly 튜플로 타입 안전성 향상
};
