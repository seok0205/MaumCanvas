import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { CANVAS_CONFIG, DRAWING_STEPS } from '@/constants/drawing';
import { useDrawingLocalStorage } from '@/hooks/useDrawingLocalStorage';
import { drawingService } from '@/services/drawingService';
import { useDrawingStore } from '@/stores/useDrawingStore';
import { AuthenticationError } from '@/types/auth';
import type { DrawingCategory, HTPImageFiles } from '@/types/drawing';

export const useDrawingSubmit = (stageRef: React.RefObject<any>) => {
  const navigate = useNavigate();
  const {
    currentStep,
    stepsLines,
    savedImages,
    isSubmitting,
    setIsSubmitting,
  } = useDrawingStore();

  const { clearAllDrawings } = useDrawingLocalStorage('');

  // 캔버스를 이미지로 변환
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
    []
  );

  // 최종 제출
  const handleSubmit = useCallback(async () => {
    if (!stageRef.current) {
      toast.error('캔버스를 찾을 수 없습니다.');
      return;
    }

    // 모든 단계가 완료되었는지 확인
    const hasEmptyStep = stepsLines.some((lines: any) => lines.length === 0);
    if (hasEmptyStep) {
      toast.error('모든 단계의 그림을 완성해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const files: Partial<HTPImageFiles> = {};

      // 각 단계별로 이미지 생성
      for (let i = 0; i < DRAWING_STEPS.length; i++) {
        const stepData = DRAWING_STEPS[i];
        if (!stepData) continue;

        // 현재 단계가 아닌 경우 임시로 해당 단계의 선들을 렌더링
        if (i !== currentStep) {
          // 기존에 저장된 이미지가 있으면 사용
          const stepId = stepData.id as DrawingCategory;
          if (savedImages[stepId]) {
            const fileName = `${stepId.toLowerCase()}_image.png`;
            const file = canvasToFile(savedImages[stepId], fileName);

            if (stepId === 'HOME') files.homeImageUrl = file;
            else if (stepId === 'TREE') files.treeImageUrl = file;
            else if (stepId === 'PERSON1') files.humanImageFirstUrl = file;
            else if (stepId === 'PERSON2') files.humanImageSecondUrl = file;
          }
        } else {
          // 현재 단계는 실시간으로 캔버스에서 가져오기
          const dataURL = stageRef.current.toDataURL({
            mimeType: 'image/png',
            quality: CANVAS_CONFIG.IMAGE_QUALITY,
            pixelRatio: CANVAS_CONFIG.PIXEL_RATIO,
          });

          const stepId = stepData.id as DrawingCategory;
          const fileName = `${stepId.toLowerCase()}_image.png`;
          const file = canvasToFile(dataURL, fileName);

          if (stepId === 'HOME') files.homeImageUrl = file;
          else if (stepId === 'TREE') files.treeImageUrl = file;
          else if (stepId === 'PERSON1') files.humanImageFirstUrl = file;
          else if (stepId === 'PERSON2') files.humanImageSecondUrl = file;
        }
      }

      // 필수 파일들이 모두 있는지 확인
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

      // 제출 성공 후 localStorage에서 모든 임시저장 데이터 삭제
      clearAllDrawings();

      // 결과 페이지로 이동하거나 그림 진단 페이지로 돌아가기
      navigate('/diagnosis/drawing');
    } catch (error) {
      console.error('Submit error:', error);

      // AuthenticationError인 경우 구체적인 에러 메시지 사용
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
    stageRef,
    stepsLines,
    currentStep,
    savedImages,
    canvasToFile,
    navigate,
    clearAllDrawings,
    setIsSubmitting,
  ]);

  return {
    isSubmitting,
    handleSubmit,
    canvasToFile,
  };
};
