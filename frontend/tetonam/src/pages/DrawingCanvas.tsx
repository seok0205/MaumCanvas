import type Konva from 'konva';
import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { DrawingControls } from '@/components/drawing/DrawingControls';
import { DrawingStage } from '@/components/drawing/DrawingStage';
import { DrawingStepHeader } from '@/components/drawing/DrawingStepHeader';
import { DrawingThumbnails } from '@/components/drawing/DrawingThumbnails';
import DrawingToolbar from '@/components/drawing/DrawingToolbar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { CommonHeader } from '@/components/layout/CommonHeader';
import {
  MobileSidebarToggle,
  SidebarProvider,
} from '@/components/ui/navigation/sidebar';
import { DRAWING_STEPS } from '@/constants/drawing';
import { useCanvasResize } from '@/hooks/drawing/useCanvasResize';
import { useDrawingNavigation } from '@/hooks/drawing/useDrawingNavigation';
import { usePopoverManagement } from '@/hooks/drawing/usePopoverManagement';
import { useCompressedLines } from '@/hooks/useCompressedLines';
import { useDrawingHandlers } from '@/hooks/useDrawingHandlers';
import { useDrawingLocalStorage } from '@/hooks/useDrawingLocalStorage';
import { useDrawingSave } from '@/hooks/useDrawingSave';
import { useDrawingSubmit } from '@/hooks/useDrawingSubmit';
import { usePageLeaveWarning } from '@/hooks/usePageLeaveWarning';
import { usePreventDoubleClick } from '@/hooks/usePreventDoubleClick';
import { useAuthStore } from '@/stores/useAuthStore';
import { useDrawingStore } from '@/stores/useDrawingStore';
import { useUIStore } from '@/stores/useUIStore';
import type { DrawingCategory } from '@/types/drawing';

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

  // 캔버스 크기 관리 훅
  useCanvasResize({
    containerRef: canvasContainerRef,
    isEditingActive,
    setStageSize,
    currentStep,
  });

  // 네비게이션 관리 훅
  const { handlePrevStep, handleNextStep, handleThumbnailSelect, canGoNext } =
    useDrawingNavigation({
      currentStep,
      setCurrentStep,
      setIsEditingActive,
      closeAllPopovers,
      goToPrevStep,
      goToNextStep,
    });

  // 팝오버 관리 훅
  usePopoverManagement({
    showSizeOptions,
    showColorOptions,
    sizePopoverRef,
    colorPopoverRef,
    closeAllPopovers,
  });

  // 페이지 이탈 경고 훅
  usePageLeaveWarning(
    hasUnsavedChanges(),
    '저장되지 않은 그림이 있습니다. 정말 페이지를 떠나시겠습니까?'
  );

  // 저장 상태 추적
  const saveStates = getSaveStates();

  const { decompress } = useCompressedLines();

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
          <CommonHeader user={user!} />

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

              {/* 캔버스 영역 */}
              <div
                ref={canvasContainerRef}
                className='flex-1 relative flex items-start justify-center pb-4'
              >
                <DrawingStage
                  stageRef={stageRef}
                  stageSize={stageSize}
                  currentLines={currentLines}
                  isEditingActive={isEditingActive}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onReactivate={() => setIsEditingActive(true)}
                  saveAnimationKey={saveAnimationKey}
                  reActivateButtonRef={reActivateButtonRef}
                />
              </div>

              {/* 네비게이션 버튼 */}
              <DrawingControls
                currentStep={currentStep}
                isEditingActive={isEditingActive}
                isSubmitting={isSubmitting}
                isBlocked={isBlocked}
                stepsLines={stepsLines}
                saveStates={saveStates}
                onPrevStep={handlePrevStep}
                onNextStep={handleNextStep}
                onSubmit={preventDoubleClick(handleSubmit)}
                canGoNext={canGoNext}
              />
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
