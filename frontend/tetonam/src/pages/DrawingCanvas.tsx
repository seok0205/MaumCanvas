import type Konva from 'konva';
import { memo, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

import { DrawingErrorBoundary } from '@/components/common/DrawingErrorBoundary';
import { DrawingControls } from '@/components/drawing/DrawingControls';
import { DrawingStage } from '@/components/drawing/DrawingStage';
import { DrawingStepHeader } from '@/components/drawing/DrawingStepHeader';
import { DrawingThumbnails } from '@/components/drawing/DrawingThumbnails';
import { DrawingToolbar } from '@/components/drawing/DrawingToolbar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { CommonHeader } from '@/components/layout/CommonHeader';
import {
  MobileSidebarToggle,
  SidebarProvider,
} from '@/components/ui/navigation/sidebar';
import { DRAWING_STEPS } from '@/constants/drawing';
import { useCanvasResize } from '@/hooks/drawing/useCanvasResize';
import { useDrawingNavigation } from '@/hooks/drawing/useDrawingNavigation';
import { useExpandedMode } from '@/hooks/drawing/useExpandedMode';
import { usePopoverManagement } from '@/hooks/drawing/usePopoverManagement';
import { useCompressedLines } from '@/hooks/useCompressedLines';
import { useDrawingHandlers } from '@/hooks/useDrawingHandlers';
import { useDrawingLocalStorage } from '@/hooks/useDrawingLocalStorage';
import { useDrawingSave } from '@/hooks/useDrawingSave';
import { useDrawingSubmit } from '@/hooks/useDrawingSubmit';
import { useMemoryOptimization } from '@/hooks/useMemoryOptimization';
import { usePageLeaveWarning } from '@/hooks/usePageLeaveWarning';
import { usePointerDrawingHandlers } from '@/hooks/usePointerDrawingHandlers';
import { usePreventDoubleClick } from '@/hooks/usePreventDoubleClick';
import { useSafeNavigation } from '@/hooks/useSafeNavigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useDrawingStore } from '@/stores/useDrawingStore';
import { useUIStore } from '@/stores/useUIStore';
import type { DrawingCategory } from '@/types/drawing';

// 컴포넌트 정의
const DrawingCanvas = memo(() => {
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
    savedImages,
    setCurrentStep,
    setSavedImages,
    setStepsLines,
    goToPrevStep,
    goToNextStep,
  } = useDrawingStore();

  const {
    isEditingActive,
    showSizeOptions,
    showColorOptions,
    stageSize,
    saveAnimationKey,
    setIsEditingActive,
    setStageSize,
    closeAllPopovers,
  } = useUIStore();

  // 현재 단계의 선들
  const currentLines = stepsLines[currentStep] || [];

  // 더블 클릭 방지 훅
  const { isBlocked, preventDoubleClick } = usePreventDoubleClick();

  // 안전한 네비게이션 훅 (PWA 리다이렉트 방지)
  const { setDrawingActive, allowNavigation } = useSafeNavigation();

  // 메모리 최적화 훅 (태블릿 PWA 환경용)
  const { performMemoryCleanup, checkMemoryStatus } = useMemoryOptimization({
    maxLinesPerStep: 800, // 태블릿 메모리 고려하여 제한
    maxHistoryEntries: 8,
    memoryCheckInterval: 45000, // 45초마다 체크
    autoCleanup: true,
  });

  // drawing handlers hook
  const { handleMouseDown, handleMouseMove, handleMouseUp } =
    useDrawingHandlers();

  // 터치펜 전용 핸들러 (선택적 사용)
  const { handlePointerDown, handlePointerMove, handlePointerUp } =
    usePointerDrawingHandlers();

  // localStorage 관리 훅
  const { getSaveStates, hasUnsavedChanges, restoreFromStorage, saveDrawing } =
    useDrawingLocalStorage(user?.id || '');

  // 저장 기능
  // 기존 동일 훅 인스턴스의 saveDrawing 사용 (중복 인스턴스 생성으로 인한 상태 불일치 방지)
  const { handleSave } = useDrawingSave(
    stageRef,
    reActivateButtonRef,
    saveDrawing
  );

  // 제출 기능
  const { handleSubmit } = useDrawingSubmit(stageRef);

  // 저장 상태 추적
  const saveStates = getSaveStates();

  const { decompress } = useCompressedLines();

  // 확대 모드 관리 훅
  const {
    isExpandedMode,
    isToolbarVisible,
    enterExpandedMode,
    exitExpandedMode,
    toggleToolbar,
  } = useExpandedMode();

  // 확대 모드 해제 시 캔버스 크기 재계산 강제 트리거
  useEffect(() => {
    if (!isExpandedMode) {
      // 확대 모드에서 일반 모드로 돌아올 때 작은 지연 후 크기 재계산
      const timeoutId = setTimeout(() => {
        if (canvasContainerRef.current) {
          // 컨테이너 크기 기반으로 다시 계산
          const event = new Event('resize');
          window.dispatchEvent(event);

          // 메모리 정리도 함께 수행
          checkMemoryStatus();
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }

    return undefined;
  }, [isExpandedMode, checkMemoryStatus]);

  // 캔버스 크기 관리 훅
  useCanvasResize({
    containerRef: canvasContainerRef,
    isEditingActive,
    setStageSize,
    currentStep,
    isExpandedMode,
  });

  // 확대 모드 토글 핸들러
  const handleExpandedModeToggle = useCallback(() => {
    if (isExpandedMode) {
      exitExpandedMode();
    } else {
      enterExpandedMode();
    }
  }, [isExpandedMode, enterExpandedMode, exitExpandedMode]);

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

  // 그리기 활성 상태 추적 (PWA 리다이렉트 방지)
  useEffect(() => {
    setDrawingActive(isEditingActive);
  }, [isEditingActive, setDrawingActive]);

  // 컴포넌트 언마운트 시 네비게이션 허용
  useEffect(() => {
    return () => {
      allowNavigation();
    };
  }, [allowNavigation]);

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

  /**
   * 에러 처리 콜백 (PWA 리다이렉트 방지 개선)
   */
  const handleDrawingError = useCallback(
    (error: Error, errorInfo: any) => {
      console.error('Drawing canvas error:', error, errorInfo);

      // 메모리 관련 에러인 경우 즉시 정리
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes('memory') || errorMessage.includes('heap')) {
        performMemoryCleanup();
      }

      // 네트워크 관련 에러는 조용히 처리 (리다이렉트 방지)
      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        console.warn(
          'Network error in drawing canvas, continuing silently:',
          error
        );
        return; // 에러를 더 이상 전파하지 않음
      }

      // Service Worker 관련 에러 조용히 처리
      if (
        errorMessage.includes('service worker') ||
        errorMessage.includes('sw.js')
      ) {
        console.warn(
          'Service Worker error in drawing canvas, continuing silently:',
          error
        );
        return;
      }
    },
    [performMemoryCleanup]
  );

  return (
    <DrawingErrorBoundary
      onError={handleDrawingError}
      fallback={
        <div className='min-h-screen flex items-center justify-center bg-gray-50'>
          <div className='text-center'>
            <h2 className='text-xl font-semibold mb-4'>
              그리기 도구를 불러오는 중...
            </h2>
            <p className='text-gray-600'>잠시만 기다려주세요.</p>
          </div>
        </div>
      }
    >
      <SidebarProvider>
        {/* 편집(그리기) 중 텍스트 드래그/선택 방지: 페이지 루트에 select-none 적용 */}
        <div
          className={`flex w-full min-h-screen bg-orange-50/30 ${
            isEditingActive ? 'select-none' : ''
          } ${isExpandedMode ? 'bg-black' : ''}`}
        >
          {!isExpandedMode && <AppSidebar />}

          <div className='flex flex-1 flex-col'>
            {!isExpandedMode && <CommonHeader user={user!} />}{' '}
            {/* 메인 콘텐츠 */}
            <main className='flex-1 overflow-hidden flex flex-col'>
              <div
                className={`${isExpandedMode ? 'p-0' : 'p-4 md:p-6'} flex-1 flex flex-col`}
              >
                {/* 헤더 (편집 시작 시 접기 - 진행 정보 & 썸네일) */}
                {!isEditingActive && !isExpandedMode && (
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

                {/* 안내문 (확대 모드가 아닐 때만 표시) */}
                {!isExpandedMode && (
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
                )}

                {/* 도구모음 (편집 중이고 확대 모드가 아닐 때만 표시, 확대 모드에서는 팔레트 토글로 제어) */}
                {isEditingActive &&
                  (!isExpandedMode || (isExpandedMode && isToolbarVisible)) && (
                    <div className='mb-4 md:mb-6 bg-white rounded-lg border border-gray-200 p-3 md:p-4 relative'>
                      <DrawingToolbar
                        sizePopoverRef={sizePopoverRef}
                        colorPopoverRef={colorPopoverRef}
                        handleSave={handleSave}
                      />
                    </div>
                  )}

                {/* 캔버스 영역 */}
                <div
                  ref={canvasContainerRef}
                  className={`flex-1 relative flex items-start justify-center pb-4 overscroll-contain ${
                    isEditingActive ? 'touch-none select-none' : ''
                  } ${isExpandedMode ? 'items-center' : ''}`}
                >
                  {/* 확대 모드 전용 팔레트 UI (토글로 제어) */}
                  {isExpandedMode && isEditingActive && isToolbarVisible && (
                    <div className='absolute top-4 left-4 z-20'>
                      <div className='bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 p-3 shadow-lg'>
                        <DrawingToolbar
                          sizePopoverRef={sizePopoverRef}
                          colorPopoverRef={colorPopoverRef}
                          handleSave={handleSave}
                        />
                      </div>
                    </div>
                  )}

                  <DrawingStage
                    stageRef={stageRef}
                    stageSize={stageSize}
                    currentLines={currentLines}
                    isEditingActive={isEditingActive}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onReactivate={() => setIsEditingActive(true)}
                    saveAnimationKey={saveAnimationKey}
                    reActivateButtonRef={reActivateButtonRef}
                    onExpandedModeToggle={handleExpandedModeToggle}
                    onToolbarToggle={toggleToolbar}
                    isExpandedMode={isExpandedMode}
                    isToolbarVisible={isToolbarVisible}
                  />
                </div>

                {/* 네비게이션 버튼 (확대 모드가 아닐 때만 표시) */}
                {!isExpandedMode && (
                  <DrawingControls
                    saveStates={saveStates}
                    onPrevStep={handlePrevStep}
                    onNextStep={handleNextStep}
                    onSubmit={preventDoubleClick(handleSubmit)}
                    isBlocked={isBlocked}
                    canGoNext={canGoNext}
                  />
                )}
              </div>
            </main>
          </div>

          {/* 모바일 사이드바 토글 버튼 */}
          {!isExpandedMode && <MobileSidebarToggle />}
        </div>
      </SidebarProvider>
    </DrawingErrorBoundary>
  );
});

DrawingCanvas.displayName = 'DrawingCanvas';

export { DrawingCanvas };
