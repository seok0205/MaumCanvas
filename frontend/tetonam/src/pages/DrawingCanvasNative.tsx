import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Eraser,
  Palette,
  Pen,
  Redo,
  Save,
  Undo,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { AppSidebar } from '@/components/layout/AppSidebar';
import { CommonHeader } from '@/components/layout/CommonHeader';
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
import { useFreehandCanvas } from '@/hooks/useFreehandCanvas';
import { usePreventDoubleClick } from '@/hooks/usePreventDoubleClick';
import { drawingService } from '@/services/drawingService';
import { useAuthStore } from '@/stores/useAuthStore';
import { AuthenticationError } from '@/types/auth';
import type { DrawingCategory, HTPImageFiles } from '@/types/drawing';

const DRAWING_STEPS = [
  {
    id: 'HOME',
    title: '집 그리기',
    description: '편안한 공간을 표현하세요.',
    instruction: '집의 모습을 자유롭게 그려주세요.',
  },
  {
    id: 'TREE',
    title: '나무 그리기',
    description: '생명력과 성장을 상징.',
    instruction: '마음 속 나무를 자유롭게.',
  },
  {
    id: 'PERSON1',
    title: '사람 그리기 (첫 번째)',
    description: '첫 번째 사람.',
    instruction: '어떤 사람이든 좋습니다.',
  },
  {
    id: 'PERSON2',
    title: '사람 그리기 (두 번째)',
    description: '두 번째 사람.',
    instruction: '첫 번째와 다른 사람.',
  },
] as const;

const BRUSH_SIZES = [2, 5] as const;
const COLORS = ['#000000', '#4B5563', '#1F2937', '#6B7280', '#111827'];

export const DrawingCanvasNative = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { preventDoubleClick } = usePreventDoubleClick();
  const { saveDrawing, clearAllDrawings, getSaveStates, restoreFromStorage } =
    useDrawingLocalStorage(user?.id || '');
  const [currentStep, setCurrentStep] = useState(0);
  const [started, setStarted] = useState(false);
  const [savedImages, setSavedImages] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canvas = useFreehandCanvas({});

  useEffect(() => {
    if (user?.id) {
      const restored = restoreFromStorage();
      if (Object.keys(restored).length) {
        setSavedImages(restored);
        toast.info('저장된 그림을 불러왔습니다.');
      }
    }
  }, [user?.id, restoreFromStorage]);

  const saveStates = getSaveStates();
  const currentStepData = DRAWING_STEPS[currentStep];
  if (!currentStepData) {
    return <div>잘못된 단계입니다.</div>;
  }

  const handleTempSave = useCallback(async () => {
    try {
      const blob = await canvas.exportPNG();
      const reader = new FileReader();
      reader.onload = async () => {
        const dataURL = reader.result as string;
        const stepId = currentStepData?.id as DrawingCategory;
        if (stepId) {
          await saveDrawing(stepId, dataURL);
          setSavedImages(prev => ({ ...prev, [stepId]: dataURL }));
          toast.success(`${currentStepData.title} 임시저장 완료`);
        }
        setStarted(false);
      };
      reader.readAsDataURL(blob);
    } catch (e) {
      toast.error('임시저장 실패');
    }
  }, [canvas, currentStepData, saveDrawing]);

  const handleNext = () => {
    if (currentStep < DRAWING_STEPS.length - 1) setCurrentStep(s => s + 1);
  };
  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };

  const canvasEmpty =
    canvas.strokes.length === 0 && !savedImages[currentStepData.id];

  const handleSubmit = useCallback(async () => {
    if (
      DRAWING_STEPS.some((s, i) =>
        i === currentStep
          ? canvas.strokes.length === 0 && !savedImages[s.id]
          : !savedImages[s.id]
      )
    ) {
      toast.error('모든 단계를 저장해주세요.');
      return;
    }
    setIsSubmitting(true);
    try {
      const files: Partial<HTPImageFiles> = {};
      for (const step of DRAWING_STEPS) {
        let dataURL = savedImages[step.id];
        if (step.id === currentStepData.id && !dataURL) {
          const blob = await canvas.exportPNG();
          dataURL = await new Promise<string>((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = () => resolve(fr.result as string);
            fr.onerror = () => reject(new Error('read error'));
            fr.readAsDataURL(blob);
          });
        }
        if (!dataURL) throw new Error('missing image');
        const file = dataURLToFile(
          dataURL,
          `${step.id.toLowerCase()}_image.png`
        );
        if (step.id === 'HOME') files.homeImageUrl = file;
        else if (step.id === 'TREE') files.treeImageUrl = file;
        else if (step.id === 'PERSON1') files.humanImageFirstUrl = file;
        else if (step.id === 'PERSON2') files.humanImageSecondUrl = file;
      }
      if (
        !files.homeImageUrl ||
        !files.treeImageUrl ||
        !files.humanImageFirstUrl ||
        !files.humanImageSecondUrl
      ) {
        throw new AuthenticationError(
          'DRAWING4000',
          '이미지가 누락되었습니다.'
        );
      }
      await drawingService.createDrawing(files as HTPImageFiles);
      toast.success('제출 완료');
      clearAllDrawings();
      navigate('/diagnosis/drawing');
    } catch (e) {
      toast.error('제출 실패');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    canvas,
    currentStep,
    currentStepData,
    savedImages,
    navigate,
    clearAllDrawings,
  ]);

  if (!user) return <div>로딩 중...</div>;

  return (
    <SidebarProvider>
      <div className='flex w-full min-h-screen bg-orange-50/30 overflow-hidden'>
        <AppSidebar />
        <div className='flex flex-1 flex-col'>
          <CommonHeader user={user} />
          <main className='flex-1 overflow-hidden flex flex-col p-4 md:p-6'>
            <div
              className={`transition-all duration-500 ${started ? 'max-h-0 opacity-0 overflow-hidden' : 'mb-4'}`}
            >
              <h1 className='text-2xl font-bold'>{currentStepData.title}</h1>
              <p className='text-gray-600 mt-1'>
                {currentStepData.description}
              </p>
              <div className='mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800'>
                <strong>안내:</strong> {currentStepData.instruction}
              </div>
              <div className='mt-6 flex justify-center'>
                <Button
                  onClick={() => setStarted(true)}
                  className='flex items-center gap-2'
                  disabled={started}
                >
                  <Palette className='w-4 h-4' /> 그림 그리기 시작
                </Button>
              </div>
            </div>

            {started && (
              <div className='mb-4 bg-white rounded-lg border border-gray-200 p-3 flex flex-wrap items-center gap-3'>
                <div className='flex items-center gap-2'>
                  <Button
                    size='sm'
                    variant={
                      canvas.currentTool === 'pen' ? 'default' : 'outline'
                    }
                    onClick={() => canvas.setTool('pen')}
                    aria-label='펜 도구 선택'
                    className='flex items-center gap-1'
                  >
                    <Pen className='w-4 h-4' />펜
                  </Button>
                  <Button
                    size='sm'
                    variant={
                      canvas.currentTool === 'eraser'
                        ? 'destructive'
                        : 'outline'
                    }
                    onClick={() => canvas.setTool('eraser')}
                    aria-label='지우개 도구 선택'
                    className='flex items-center gap-1'
                  >
                    <Eraser className='w-4 h-4' />
                    지우개
                  </Button>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-sm'>굵기</span>
                  {BRUSH_SIZES.map(s => (
                    <button
                      key={s}
                      onClick={() => canvas.setSize(s)}
                      aria-label={`브러시 굵기 ${s}`}
                      className={`w-8 h-8 flex items-center justify-center rounded-full border text-xs ${canvas.size === s ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-sm'>색상</span>
                  {COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => canvas.setColor(c)}
                      aria-label={`색상 ${c}`}
                      style={{ backgroundColor: c }}
                      className={`w-6 h-6 rounded-full border-2 ${canvas.color === c ? 'border-gray-800' : 'border-gray-300'}`}
                    />
                  ))}
                </div>
                <div className='flex items-center gap-2 ml-auto'>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={canvas.undo}
                    disabled={!canvas.canUndo}
                    aria-label='실행취소'
                    className='flex items-center gap-1'
                  >
                    <Undo className='w-4 h-4' />
                    실행취소
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={canvas.redo}
                    disabled={!canvas.canRedo}
                    aria-label='되돌리기'
                    className='flex items-center gap-1'
                  >
                    <Redo className='w-4 h-4' />
                    되돌리기
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={canvas.clear}
                    disabled={!canvas.canUndo}
                    aria-label='캔버스 초기화'
                  >
                    초기화
                  </Button>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={handleTempSave}
                    disabled={canvas.strokes.length === 0}
                    aria-label='임시저장'
                  >
                    <Save className='w-4 h-4' />
                    임시저장
                  </Button>
                </div>
              </div>
            )}

            <div className='flex-1 flex items-center justify-center overflow-hidden'>
              <div
                className='relative'
                style={{
                  width: '100%',
                  height: '100%',
                  maxWidth: '100%',
                  maxHeight: '100%',
                }}
              >
                <div className='w-full h-full flex items-center justify-center'>
                  <div
                    className='relative'
                    style={{
                      aspectRatio: '210 / 297',
                      maxHeight: '100%',
                      maxWidth: '100%',
                      // dynamic height: header (~56px) + padding (p-4->16 *2) + toolbar (~72px) + step header wrapper height when visible
                      width: 'min(100%, calc((100vh - 180px) / 1.414))',
                    }}
                  >
                    <canvas
                      ref={canvas.canvasRef}
                      className={`w-full h-full bg-white border shadow-sm rounded ${!started ? 'pointer-events-none opacity-40' : ''}`}
                    />
                    {!started && (
                      <div className='absolute inset-0 flex items-center justify-center'>
                        <div className='text-center text-sm text-gray-600'>
                          그림 그리기 버튼을 눌러 시작하세요.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className='mt-4 flex justify-between'>
              <Button
                variant='outline'
                onClick={handlePrev}
                disabled={currentStep === 0}
              >
                <ArrowLeft className='w-4 h-4' />
                이전
              </Button>
              <div className='flex gap-3'>
                {currentStep === DRAWING_STEPS.length - 1 ? (
                  <Button
                    onClick={preventDoubleClick(handleSubmit)}
                    disabled={
                      isSubmitting ||
                      DRAWING_STEPS.some((s, i) =>
                        i === currentStep ? canvasEmpty : !savedImages[s.id]
                      )
                    }
                    className='bg-green-600 hover:bg-green-700 flex items-center gap-1'
                  >
                    <Palette className='w-4 h-4' />
                    제출
                  </Button>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Button
                            onClick={handleNext}
                            disabled={
                              saveStates[
                                DRAWING_STEPS[currentStep]
                                  ?.id as DrawingCategory
                              ]?.status !== 'saved'
                            }
                            className='flex items-center gap-1'
                          >
                            다음 <ArrowRight className='w-4 h-4' />
                          </Button>
                        </div>
                      </TooltipTrigger>
                      {saveStates[
                        DRAWING_STEPS[currentStep]?.id as DrawingCategory
                      ]?.status !== 'saved' && (
                        <TooltipContent side='top'>
                          <p>임시저장 후 진행해주세요.</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>

            <div className='mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs'>
              {DRAWING_STEPS.map((s, i) => {
                const state = saveStates[s.id as DrawingCategory];
                const saved = state?.status === 'saved';
                return (
                  <div
                    key={s.id}
                    className={`flex items-center gap-1 p-2 rounded border ${i === currentStep ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-white'}`}
                  >
                    <span className='truncate'>{s.title}</span>
                    {saved ? (
                      <CheckCircle className='w-3 h-3 text-green-600' />
                    ) : (
                      <XCircle className='w-3 h-3 text-gray-400' />
                    )}
                  </div>
                );
              })}
            </div>
          </main>
        </div>
        <MobileSidebarToggle />
      </div>
    </SidebarProvider>
  );
};

function dataURLToFile(dataURL: string, fileName: string): File {
  const parts = dataURL.split(',');
  if (parts.length < 2) throw new Error('Invalid dataURL');
  const meta = parts[0]!;
  const base64 = parts[1]!;
  const mimeMatch = meta.match(/:(.*?);/);
  const mime: string = mimeMatch?.[1] || 'image/png';
  const bin = atob(base64);
  const len = bin.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
  return new File([bytes], fileName, { type: mime });
}

export default DrawingCanvasNative;
