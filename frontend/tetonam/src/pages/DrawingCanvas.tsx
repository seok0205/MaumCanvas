import type Konva from 'konva';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Layer, Line, Stage } from 'react-konva';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { AppSidebar } from '@/components/layout/AppSidebar';
import { CommonHeader } from '@/components/layout/CommonHeader';
import { ApiButton } from '@/components/ui/ApiButton';
import { Button } from '@/components/ui/interactive/button';
import {
  MobileSidebarToggle,
  SidebarProvider,
} from '@/components/ui/navigation/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/overlay/tooltip';
import { useDrawingLocalStorage } from '@/hooks/useDrawingLocalStorage';
import { usePageLeaveWarning } from '@/hooks/usePageLeaveWarning';
import { usePreventDoubleClick } from '@/hooks/usePreventDoubleClick';
import { drawingService } from '@/services/drawingService';
import { useAuthStore } from '@/stores/useAuthStore';
import { AuthenticationError } from '@/types/auth';
import type { DrawingCategory, HTPImageFiles } from '@/types/drawing';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Palette,
  Save,
  Trash2,
  Undo,
  XCircle,
} from 'lucide-react';

// 캔버스 설정 상수
const CANVAS_CONFIG = {
  WIDTH: 800,
  HEIGHT: 600,
  DEFAULT_BRUSH_SIZE: 5,
  MIN_BRUSH_SIZE: 1,
  MAX_BRUSH_SIZE: 20,
  IMAGE_QUALITY: 1.0,
  PIXEL_RATIO: 2,
} as const;

// 기본 색상 팔레트
const COLOR_PALETTE = [
  '#000000',
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#FF00FF',
  '#00FFFF',
  '#FFA500',
  '#800080',
  '#FFC0CB',
  '#A52A2A',
  '#808080',
  '#000080',
  '#008000',
  '#800000',
] as const;

// 그림 그리기 단계 정의
const DRAWING_STEPS = [
  {
    id: 'HOME',
    title: '집 그리기',
    description: '편안하고 안전한 공간인 집을 자유롭게 그려보세요.',
    instruction:
      '집의 모습을 상상하며 자유롭게 표현해주세요. 크기나 형태에 제한이 없습니다.',
  },
  {
    id: 'TREE',
    title: '나무 그리기',
    description: '생명력과 성장을 상징하는 나무를 그려보세요.',
    instruction:
      '어떤 나무든 상관없습니다. 마음에 떠오르는 나무의 모습을 그려주세요.',
  },
  {
    id: 'PERSON1',
    title: '사람 그리기 (첫 번째)',
    description: '첫 번째 사람을 그려보세요.',
    instruction:
      '어떤 사람이든 좋습니다. 자신일 수도, 다른 사람일 수도 있어요.',
  },
  {
    id: 'PERSON2',
    title: '사람 그리기 (두 번째)',
    description: '두 번째 사람을 그려보세요.',
    instruction:
      '첫 번째와 다른 사람을 그려보세요. 관계나 상황을 자유롭게 표현하세요.',
  },
] as const;

// 브러시 도구 설정
const BRUSH_SIZES = [2, 5, 10, 15, 20] as const;

export const DrawingCanvas = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const stageRef = useRef<Konva.Stage>(null);

  // 더블 클릭 방지 훅
  const { isBlocked, preventDoubleClick } = usePreventDoubleClick();

  // localStorage 관리 훅
  const {
    saveDrawing,
    clearAllDrawings,
    getSaveStates,
    hasUnsavedChanges,
    restoreFromStorage,
  } = useDrawingLocalStorage(user?.id || '');

  // 페이지 이탈 경고 훅
  usePageLeaveWarning(
    hasUnsavedChanges(),
    '저장되지 않은 그림이 있습니다. 정말 페이지를 떠나시겠습니까?'
  );

  // 현재 단계 상태
  const [currentStep, setCurrentStep] = useState(0);

  // 그리기 상태
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState<number>(
    CANVAS_CONFIG.DEFAULT_BRUSH_SIZE
  );
  const [brushColor, setBrushColor] = useState<string>(COLOR_PALETTE[0]);

  // 각 단계별 선 데이터 저장
  const [stepsLines, setStepsLines] = useState<Array<Array<any>>>([
    [],
    [],
    [],
    [], // 4단계 초기화
  ]);

  // 현재 단계의 선들
  const currentLines = stepsLines[currentStep] || [];

  // 실행취소를 위한 히스토리
  const [history, setHistory] = useState<Array<Array<any>>>([[], [], [], []]);

  // 저장 상태 추적
  const saveStates = getSaveStates();

  // 컴포넌트 마운트 시 저장된 데이터 복원
  useEffect(() => {
    if (user?.id) {
      const restored = restoreFromStorage();
      if (Object.keys(restored).length > 0) {
        setSavedImages(restored);
        toast.info('이전에 저장된 그림을 복원했습니다.');
      }
    }
  }, [user?.id, restoreFromStorage]);

  // 임시저장된 이미지들
  const [savedImages, setSavedImages] = useState<Record<string, string>>({});

  // 로딩 상태
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 그리기 시작
  const handleMouseDown = useCallback(
    (e: any) => {
      if (currentStep < 0 || currentStep >= DRAWING_STEPS.length) return;

      setIsDrawing(true);
      const pos = e.target.getStage().getPointerPosition();
      const newLine = {
        id: Date.now(),
        points: [pos.x, pos.y],
        stroke: brushColor,
        strokeWidth: brushSize,
        globalCompositeOperation: 'source-over',
      };

      const newStepsLines = [...stepsLines];
      newStepsLines[currentStep] = [...currentLines, newLine];
      setStepsLines(newStepsLines);
    },
    [currentStep, stepsLines, currentLines, brushColor, brushSize]
  );

  // 그리기 중
  const handleMouseMove = useCallback(
    (e: any) => {
      if (!isDrawing || currentStep < 0 || currentStep >= DRAWING_STEPS.length)
        return;

      const stage = e.target.getStage();
      const point = stage.getPointerPosition();
      const newStepsLines = [...stepsLines];
      const currentStepLines = newStepsLines[currentStep];

      if (!currentStepLines || currentStepLines.length === 0) return;

      const lastLine = currentStepLines[currentStepLines.length - 1];

      if (lastLine) {
        lastLine.points = lastLine.points.concat([point.x, point.y]);
        setStepsLines(newStepsLines);
      }
    },
    [isDrawing, currentStep, stepsLines]
  );

  // 그리기 종료
  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);

    // 히스토리에 현재 상태 저장 (실행취소용)
    const newHistory = [...history];
    const currentStepLines = stepsLines[currentStep];
    if (currentStepLines) {
      newHistory[currentStep] = [...currentStepLines];
      setHistory(newHistory);
    }
  }, [history, currentStep, stepsLines]);

  // 실행취소
  const handleUndo = useCallback(() => {
    if (currentLines.length === 0) return;

    const newStepsLines = [...stepsLines];
    newStepsLines[currentStep] = currentLines.slice(0, -1);
    setStepsLines(newStepsLines);
  }, [currentLines, stepsLines, currentStep]);

  // 현재 캔버스 지우기
  const handleClear = useCallback(() => {
    const newStepsLines = [...stepsLines];
    newStepsLines[currentStep] = [];
    setStepsLines(newStepsLines);

    const newHistory = [...history];
    newHistory[currentStep] = [];
    setHistory(newHistory);
  }, [stepsLines, currentStep, history]);

  // 이전 단계로
  const handlePrevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  // 다음 단계로
  const handleNextStep = useCallback(() => {
    if (currentStep < DRAWING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep]);

  // 임시저장 (localStorage 사용)
  const handleSave = useCallback(async () => {
    if (!stageRef.current || !user?.id) {
      toast.error('저장할 수 없습니다.');
      return;
    }

    const currentStepData = DRAWING_STEPS[currentStep];
    if (!currentStepData) return;

    try {
      const dataURL = stageRef.current.toDataURL({
        mimeType: 'image/png',
        quality: CANVAS_CONFIG.IMAGE_QUALITY,
        pixelRatio: CANVAS_CONFIG.PIXEL_RATIO,
      });

      const stepId = currentStepData.id as DrawingCategory;

      // localStorage에 저장
      await saveDrawing(stepId, dataURL);

      // 기존 메모리 저장도 유지 (하위 호환성)
      setSavedImages(prev => ({
        ...prev,
        [stepId]: dataURL,
      }));

      toast.success(`${currentStepData.title} 임시저장 완료!`);
    } catch (error) {
      console.error('Save error:', error);

      if (error instanceof AuthenticationError) {
        toast.error(error.message);
      } else {
        toast.error('임시저장 중 오류가 발생했습니다.');
      }
    }
  }, [currentStep, user?.id, saveDrawing]);

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
    const hasEmptyStep = stepsLines.some(lines => lines.length === 0);
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
          const stepId = stepData.id;
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

          const stepId = stepData.id;
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
      const result = await drawingService.createDrawing(files as HTPImageFiles);

      toast.success('그림이 성공적으로 제출되었습니다!', {
        description: 'AI 분석이 시작됩니다. 잠시만 기다려주세요.',
      });

      console.log('Drawing submission result:', result);

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
  }, [stageRef, stepsLines, currentStep, savedImages, canvasToFile, navigate]);

  if (!user) {
    return <div>로딩 중...</div>;
  }

  const currentStepData = DRAWING_STEPS[currentStep];

  if (!currentStepData) {
    return <div>잘못된 단계입니다.</div>;
  }

  return (
    <SidebarProvider>
      <div className='flex w-full min-h-screen bg-orange-50/30'>
        <AppSidebar />

        <div className='flex flex-1 flex-col'>
          <CommonHeader user={user} />

          {/* 메인 콘텐츠 */}
          <main className='flex-1 overflow-hidden flex flex-col'>
            <div className='p-6 flex-1 flex flex-col'>
              {/* 헤더 */}
              <div className='mb-6'>
                <div className='flex items-center justify-between mb-4'>
                  <div>
                    <h1 className='text-2xl font-bold text-gray-900'>
                      {currentStepData.title}
                    </h1>
                    <p className='text-gray-600 mt-1'>
                      {currentStepData.description}
                    </p>
                  </div>

                  {/* 진행상황 */}
                  <div className='text-right'>
                    <div className='text-sm text-gray-500 mb-1'>
                      {currentStep + 1} / {DRAWING_STEPS.length}
                    </div>
                    <div className='w-32 h-2 bg-gray-200 rounded-full'>
                      <div
                        className='h-2 bg-yellow-500 rounded-full transition-all duration-300'
                        style={{
                          width: `${((currentStep + 1) / DRAWING_STEPS.length) * 100}%`,
                        }}
                      />
                    </div>

                    {/* 저장 상태 표시 */}
                    <div className='mt-3 flex flex-col gap-1'>
                      {DRAWING_STEPS.map((step, index) => {
                        const stepSaveState =
                          saveStates[step.id as DrawingCategory];
                        const isCurrent = index === currentStep;
                        return (
                          <div
                            key={step.id}
                            className='flex items-center gap-2 text-xs'
                          >
                            <span
                              className={`${isCurrent ? 'font-semibold text-yellow-600' : 'text-gray-500'}`}
                            >
                              {step.title}
                            </span>
                            {stepSaveState?.status === 'saved' ? (
                              <CheckCircle className='w-3 h-3 text-green-500' />
                            ) : stepSaveState?.status === 'saving' ? (
                              <div className='w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin' />
                            ) : (
                              <XCircle className='w-3 h-3 text-gray-400' />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 안내 메시지 */}
                <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
                  <p className='text-yellow-800 text-sm'>
                    <strong>안내:</strong> {currentStepData.instruction}
                  </p>
                </div>
              </div>

              {/* 도구모음 */}
              <div className='mb-6 bg-white rounded-lg border border-gray-200 p-4'>
                <div className='flex flex-wrap items-center gap-4'>
                  {/* 브러시 크기 */}
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-medium text-gray-700'>
                      크기:
                    </span>
                    <div className='flex gap-1'>
                      {BRUSH_SIZES.map(size => (
                        <button
                          key={size}
                          onClick={() => setBrushSize(size)}
                          className={`
                            w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium
                            ${
                              brushSize === size
                                ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                                : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                            }
                          `}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 색상 선택 */}
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-medium text-gray-700'>
                      색상:
                    </span>
                    <div className='flex gap-1'>
                      {COLOR_PALETTE.map(color => (
                        <button
                          key={color}
                          onClick={() => setBrushColor(color)}
                          className={`
                            w-8 h-8 rounded-full border-2
                            ${
                              brushColor === color
                                ? 'border-gray-800 ring-2 ring-gray-400'
                                : 'border-gray-300 hover:border-gray-400'
                            }
                          `}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  {/* 도구 버튼들 */}
                  <div className='flex gap-2 ml-auto'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleUndo}
                      disabled={currentLines.length === 0}
                      className='flex items-center gap-1'
                    >
                      <Undo className='w-4 h-4' />
                      실행취소
                    </Button>

                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleClear}
                      disabled={currentLines.length === 0}
                      className='flex items-center gap-1'
                    >
                      <Trash2 className='w-4 h-4' />
                      지우기
                    </Button>

                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleSave}
                      disabled={currentLines.length === 0}
                      className='flex items-center gap-1'
                    >
                      <Save className='w-4 h-4' />
                      임시저장
                    </Button>
                  </div>
                </div>
              </div>

              {/* 캔버스 영역 */}
              <div className='flex-1 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden'>
                <Stage
                  ref={stageRef}
                  width={window.innerWidth - 400} // 사이드바 고려
                  height={window.innerHeight - 300} // 헤더, 도구모음 고려
                  onMouseDown={handleMouseDown}
                  onMousemove={handleMouseMove}
                  onMouseup={handleMouseUp}
                  onTouchStart={handleMouseDown}
                  onTouchMove={handleMouseMove}
                  onTouchEnd={handleMouseUp}
                  className='cursor-crosshair'
                >
                  <Layer>
                    {currentLines.map((line: any) => (
                      <Line
                        key={line.id}
                        points={line.points}
                        stroke={line.stroke}
                        strokeWidth={line.strokeWidth}
                        tension={0.5}
                        lineCap='round'
                        lineJoin='round'
                        globalCompositeOperation={line.globalCompositeOperation}
                      />
                    ))}
                  </Layer>
                </Stage>
              </div>

              {/* 네비게이션 버튼 */}
              <div className='mt-6 flex justify-between'>
                <Button
                  variant='outline'
                  onClick={handlePrevStep}
                  disabled={currentStep === 0}
                  className='flex items-center gap-2'
                >
                  <ArrowLeft className='w-4 h-4' />
                  이전 단계
                </Button>

                <div className='flex gap-3'>
                  {currentStep === DRAWING_STEPS.length - 1 ? (
                    <ApiButton
                      onClick={preventDoubleClick(handleSubmit)}
                      disabled={
                        isBlocked ||
                        stepsLines.some(lines => lines.length === 0)
                      }
                      isLoading={isSubmitting}
                      loadingText='제출 중...'
                      className='flex items-center gap-2 bg-green-600 hover:bg-green-700'
                    >
                      <Palette className='w-4 h-4' />
                      그림 제출하기
                    </ApiButton>
                  ) : (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Button
                              onClick={handleNextStep}
                              disabled={
                                currentStep === DRAWING_STEPS.length - 1 ||
                                saveStates[
                                  DRAWING_STEPS[currentStep]
                                    ?.id as DrawingCategory
                                ]?.status !== 'saved'
                              }
                              className='flex items-center gap-2'
                            >
                              다음 단계
                              <ArrowRight className='w-4 h-4' />
                            </Button>
                          </div>
                        </TooltipTrigger>
                        {saveStates[
                          DRAWING_STEPS[currentStep]?.id as DrawingCategory
                        ]?.status !== 'saved' && (
                          <TooltipContent side='top'>
                            <p>
                              현재 단계를 임시저장 후 다음 단계로 진행할 수
                              있습니다
                            </p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* 모바일 사이드바 토글 버튼 */}
        <MobileSidebarToggle />
      </div>
    </SidebarProvider>
  );
};
