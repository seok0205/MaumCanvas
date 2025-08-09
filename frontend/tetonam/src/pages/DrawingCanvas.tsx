import type Konva from 'konva';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { Layer, Line, Stage } from 'react-konva';
import { toast } from 'sonner';

import { DrawingStepHeader } from '@/components/drawing/DrawingStepHeader';
import { DrawingThumbnails } from '@/components/drawing/DrawingThumbnails';
import DrawingToolbar from '@/components/drawing/DrawingToolbar';
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
import { DRAWING_STEPS } from '@/constants/drawing';
import { useCompressedLines } from '@/hooks/useCompressedLines';
import { useDrawingHandlers } from '@/hooks/useDrawingHandlers';
import { useDrawingLocalStorage } from '@/hooks/useDrawingLocalStorage';
import { useDrawingSave } from '@/hooks/useDrawingSave';
import { useDrawingSubmit } from '@/hooks/useDrawingSubmit';
import { usePageLeaveWarning } from '@/hooks/usePageLeaveWarning';
import { usePreventDoubleClick } from '@/hooks/usePreventDoubleClick';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useAuthStore } from '@/stores/useAuthStore';
import { useDrawingStore } from '@/stores/useDrawingStore';
import { useUIStore } from '@/stores/useUIStore';
import type { DrawingCategory } from '@/types/drawing';
import { ArrowLeft, ArrowRight, Palette } from 'lucide-react';

// A4 비율 상수
const A4_RATIO = 1.4142; // 높이 / 너비 (A4 세로 비율)

// 컴포넌트 상태

const DrawingCanvas = () => {
  const { user } = useAuthStore();
  const stageRef = useRef<Konva.Stage>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const reActivateButtonRef = useRef<HTMLButtonElement>(null);
  const sizePopoverRef = useRef<HTMLDivElement>(null);
  const colorPopoverRef = useRef<HTMLDivElement>(null);

  // 스토어에서 상태 가져오기
  const {
    currentStep,
    stepsLines,
    redoStacks,
    savedImages,
    isSubmitting,
    setCurrentStep,
    setSavedImages,
    setStepsLines,
    goToPrevStep,
    goToNextStep,
    undo,
    redo,
    clearCurrentStep,
  } = useDrawingStore();

  const {
    isEditingActive,
    showSizeOptions,
    showColorOptions,
    isEraser,
    brushSize,
    brushColor,
    stageSize,
    saveAnimationKey,
    setIsEditingActive,
    setShowSizeOptions,
    setShowColorOptions,
    setIsEraser,
    setBrushSize,
    setBrushColor,
    setStageSize,
    closeAllPopovers,
  } = useUIStore();

  // 현재 단계의 선들
  const currentLines = stepsLines[currentStep] || [];

  // 더블 클릭 방지 훅
  const { isBlocked, preventDoubleClick } = usePreventDoubleClick();

  // drawing handlers hook
  const { handleMouseDown, handleMouseMove, handleMouseUp } =
    useDrawingHandlers();

  // localStorage 관리 훅
  const { getSaveStates, hasUnsavedChanges, restoreFromStorage } =
    useDrawingLocalStorage(user?.id || '');

  // 저장 기능
  const { handleSave } = useDrawingSave(stageRef, reActivateButtonRef);

  // 제출 기능
  const { handleSubmit } = useDrawingSubmit(stageRef);

  // 페이지 이탈 경고 훅
  usePageLeaveWarning(
    hasUnsavedChanges(),
    '저장되지 않은 그림이 있습니다. 정말 페이지를 떠나시겠습니까?'
  );

  // 저장 상태 추적
  const saveStates = getSaveStates();
  const reduceMotion = useReducedMotion();

  const { decompress } = useCompressedLines();

  // Stage 크기 계산 (A4 비율)
  const recalcStageSize = useCallback(() => {
    const container = canvasContainerRef.current;
    if (!container) return;
    const padding = 16; // 여백
    const availWidth = container.clientWidth - padding * 2;
    const availHeight = container.clientHeight - padding * 2;

    if (isEditingActive) {
      // A4 세로 비율 유지하면서 최대 크기
      // 높이를 기준으로 폭 계산, 폭이 넘치면 폭 기준으로 다시 계산
      let height = availHeight;
      let width = height / A4_RATIO;
      if (width > availWidth) {
        width = availWidth;
        height = width * A4_RATIO;
      }
      setStageSize({ width: Math.floor(width), height: Math.floor(height) });
    } else {
      // 비활성 상태에서는 가용 공간 채우기 (비율 자유)
      setStageSize({ width: availWidth, height: availHeight });
    }
  }, [isEditingActive, setStageSize]);

  useLayoutEffect(() => {
    recalcStageSize();
  }, [recalcStageSize, currentStep, isEditingActive]);

  useEffect(() => {
    let frame: number | null = null;
    let lastRun = 0;
    const DEBOUNCE = 120; // ms
    const run = () => {
      frame = null;
      lastRun = Date.now();
      recalcStageSize();
    };
    const schedule = () => {
      const now = Date.now();
      if (now - lastRun > DEBOUNCE) {
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(run);
      } else {
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          setTimeout(run, DEBOUNCE - (now - lastRun));
        });
      }
    };
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('orientationchange', schedule, { passive: true });
    return () => {
      window.removeEventListener('resize', schedule);
      window.removeEventListener('orientationchange', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [recalcStageSize]);

  // Action handlers for toolbar
  const handleUndo = useCallback(() => {
    undo();
  }, [undo]);

  const handleRedo = useCallback(() => {
    redo();
  }, [redo]);

  const handleClear = useCallback(() => {
    clearCurrentStep();
  }, [clearCurrentStep]);

  // 기존 이미지 + 압축 라인 복원 (초기 마운트)
  useEffect(() => {
    if (!user?.id) return;
    const restoredImages = restoreFromStorage();
    if (Object.keys(restoredImages).length > 0) setSavedImages(restoredImages);
    const reconstructed: Array<Array<any>> = [[], [], [], []];
    (['HOME', 'TREE', 'PERSON1', 'PERSON2'] as DrawingCategory[]).forEach(
      (stepId, idx) => {
        try {
          const key = `DRAWING_COMPRESSED_${user.id}_${stepId}`;
          const raw = localStorage.getItem(key);
          if (!raw) return;
          const lines = decompress(raw);
          if (lines.length > 0) {
            reconstructed[idx] = lines.map(l => ({
              id: l.id,
              points: l.points,
              stroke: l.stroke,
              strokeWidth: l.strokeWidth,
              globalCompositeOperation:
                l.globalCompositeOperation || 'source-over',
            }));
          }
        } catch (e) {
          console.warn('압축 라인 복원 실패:', stepId, e);
        }
      }
    );
    setStepsLines(reconstructed);
    if (
      Object.keys(restoredImages).length > 0 ||
      reconstructed.some(a => a.length > 0)
    ) {
      toast.info('이전에 저장된 그림을 복원했습니다.');
    }
  }, [user?.id, restoreFromStorage, decompress, setSavedImages, setStepsLines]);

  // 이전 단계로
  const handlePrevStep = useCallback(() => {
    goToPrevStep();
  }, [goToPrevStep]);

  // 다음 단계로
  const handleNextStep = useCallback(() => {
    goToNextStep();
  }, [goToNextStep]);

  // 팝오버 외부 클릭 닫기
  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      if (
        showSizeOptions &&
        sizePopoverRef.current &&
        !sizePopoverRef.current.contains(e.target as Node)
      ) {
        closeAllPopovers();
      }
      if (
        showColorOptions &&
        colorPopoverRef.current &&
        !colorPopoverRef.current.contains(e.target as Node)
      ) {
        closeAllPopovers();
      }
    };
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, [showSizeOptions, showColorOptions]);

  if (!user) {
    return <div>로딩 중...</div>;
  }

  const currentStepData = DRAWING_STEPS[currentStep];

  if (!currentStepData) {
    return <div>잘못된 단계입니다.</div>;
  }

  // 썸네일 클릭 시 해당 단계 이동 + 편집 재활성화
  const handleThumbnailSelect = useCallback(
    (index: number) => {
      if (index < 0 || index >= DRAWING_STEPS.length) return;
      setCurrentStep(index);
      // 단계 전환 직후 레이아웃 계산 후 편집 활성화
      setIsEditingActive(true);
      // 팝오버 초기화
      closeAllPopovers();
      // 지우개 상태 유지 (사용자 선택 존중)
    },
    [setCurrentStep, setIsEditingActive, closeAllPopovers]
  );

  return (
    <SidebarProvider>
      <div className='flex w-full min-h-screen bg-orange-50/30'>
        <AppSidebar />

        <div className='flex flex-1 flex-col'>
          <CommonHeader user={user} />

          {/* 메인 콘텐츠 */}
          <main className='flex-1 overflow-hidden flex flex-col'>
            <div className='p-4 md:p-6 flex-1 flex flex-col'>
              {/* 헤더 (편집 시작 시 접기 - 진행 정보 & 썸네일) */}
              {!isEditingActive && (
                <div className='mb-4 md:mb-4 transition-all duration-300'>
                  <DrawingStepHeader
                    currentStep={currentStep}
                    currentStepData={currentStepData}
                    saveStates={saveStates}
                  />
                  <DrawingThumbnails
                    savedImages={savedImages}
                    currentStep={currentStep}
                    handleThumbnailSelect={handleThumbnailSelect}
                  />
                </div>
              )}

              {/* 안내문 (편집 중에도 항상 표시, 편집 시 폰트 확대) */}
              <div
                className={`mb-4 md:mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${isEditingActive ? 'ring-1 ring-yellow-300' : ''}`}
              >
                <p
                  className={`text-yellow-800 ${isEditingActive ? 'text-base md:text-lg font-semibold' : 'text-sm'} leading-relaxed`}
                >
                  <strong className='mr-1'>안내:</strong>{' '}
                  {currentStepData.instruction}
                </p>
              </div>

              {/* 도구모음 (편집 중에만 표시) */}
              {isEditingActive && (
                <div className='mb-4 md:mb-6 bg-white rounded-lg border border-gray-200 p-3 md:p-4 relative'>
                  <DrawingToolbar
                    isEraser={isEraser}
                    setIsEraser={setIsEraser}
                    brushSize={brushSize}
                    setBrushSize={setBrushSize}
                    brushColor={brushColor}
                    setBrushColor={setBrushColor}
                    showSizeOptions={showSizeOptions}
                    setShowSizeOptions={setShowSizeOptions}
                    showColorOptions={showColorOptions}
                    setShowColorOptions={setShowColorOptions}
                    sizePopoverRef={sizePopoverRef}
                    colorPopoverRef={colorPopoverRef}
                    handleUndo={handleUndo}
                    handleRedo={handleRedo}
                    handleClear={handleClear}
                    handleSave={handleSave}
                    currentLines={currentLines}
                    redoStacks={redoStacks}
                    currentStep={currentStep}
                  />
                </div>
              )}

              {/* 캔버스 영역 (실제 그릴 수 있는 영역만 표시) */}
              <div
                ref={canvasContainerRef}
                className='flex-1 relative flex items-start justify-center pb-4'
              >
                <div
                  className='relative rounded-lg border border-gray-300 bg-white shadow-sm'
                  style={{ width: stageSize.width, height: stageSize.height }}
                >
                  <Stage
                    ref={stageRef}
                    width={stageSize.width}
                    height={stageSize.height}
                    onMouseDown={handleMouseDown}
                    onMousemove={handleMouseMove}
                    onMouseup={handleMouseUp}
                    onTouchStart={handleMouseDown}
                    onTouchMove={handleMouseMove}
                    onTouchEnd={handleMouseUp}
                    className={`transition-all ${isEditingActive ? 'cursor-crosshair' : 'cursor-not-allowed opacity-60'} bg-white rounded-lg`}
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
                          globalCompositeOperation={
                            line.globalCompositeOperation
                          }
                        />
                      ))}
                    </Layer>
                  </Stage>
                  {!isEditingActive && (
                    <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                      <Button
                        ref={reActivateButtonRef}
                        onClick={() => setIsEditingActive(true)}
                        className={`flex items-center gap-2 pointer-events-auto bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-4 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition ${reduceMotion ? '' : 'origin-center motion-safe:animate-none'} ${reduceMotion ? '' : 'save-scale-in'}`}
                        data-anim-key={saveAnimationKey}
                      >
                        <Palette className='w-5 h-5' /> 그림 그리기
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* 네비게이션 버튼 (편집 중 숨김) */}
              {!isEditingActive && (
                <div className='mt-2 md:mt-4 flex justify-between'>
                  <Button
                    variant='outline'
                    onClick={handlePrevStep}
                    disabled={currentStep === 0}
                    className='flex items-center gap-2'
                  >
                    <ArrowLeft className='w-4 h-4' /> 이전 단계
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
                        <Palette className='w-4 h-4' /> 그림 제출하기
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
                                다음 단계 <ArrowRight className='w-4 h-4' />
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
              )}
            </div>
          </main>
        </div>

        {/* 모바일 사이드바 토글 버튼 */}
        <MobileSidebarToggle />
      </div>
    </SidebarProvider>
  );
};

export { DrawingCanvas };
export default DrawingCanvas;
