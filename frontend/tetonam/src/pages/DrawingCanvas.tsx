import type Konva from 'konva';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
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
import { useCompressedLines } from '@/hooks/useCompressedLines';
import { useDrawingLocalStorage } from '@/hooks/useDrawingLocalStorage';
import { usePageLeaveWarning } from '@/hooks/usePageLeaveWarning';
import { usePreventDoubleClick } from '@/hooks/usePreventDoubleClick';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { drawingService } from '@/services/drawingService';
import { useAuthStore } from '@/stores/useAuthStore';
import { AuthenticationError } from '@/types/auth';
import type { DrawingCategory, HTPImageFiles } from '@/types/drawing';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Eraser,
  Palette,
  Pencil,
  Redo,
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

// 브러시 도구 설정 (연필/볼펜 정도의 두께만 제공)
const BRUSH_SIZES = [2, 5] as const;
const A4_RATIO = 1.4142; // 높이 / 너비 (A4 세로 비율)

export const DrawingCanvas = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const stageRef = useRef<Konva.Stage>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const reActivateButtonRef = useRef<HTMLButtonElement>(null);

  // UI & 상태 관련
  const [isEditingActive, setIsEditingActive] = useState(false); // 헤더 접힘 & 도구모음 표시 여부
  const [showSizeOptions, setShowSizeOptions] = useState(false);
  const [showColorOptions, setShowColorOptions] = useState(false);
  const [isEraser, setIsEraser] = useState(false);
  const sizePopoverRef = useRef<HTMLDivElement>(null);
  const colorPopoverRef = useRef<HTMLDivElement>(null);

  // Redo 스택 (단계별)
  const [redoStacks, setRedoStacks] = useState<Array<Array<any>>>([
    [],
    [],
    [],
    [],
  ]);

  // Stage 크기 (반응형 A4 비율 적용)
  const [stageSize, setStageSize] = useState<{ width: number; height: number }>(
    { width: CANVAS_CONFIG.WIDTH, height: CANVAS_CONFIG.HEIGHT }
  );

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

  const { compress, decompress } = useCompressedLines();

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
  }, [user?.id, restoreFromStorage, decompress]);

  // 임시저장된 이미지들
  const [savedImages, setSavedImages] = useState<Record<string, string>>({});

  // 로딩 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  const reduceMotion = useReducedMotion();
  // compress 이미 위에서 구조분해
  const [saveAnimationKey, setSaveAnimationKey] = useState(0); // triggers scale animation

  // 압축된 라인 로드 (복원 로직 확장 가능) - 현재는 라인 자체는 메모리 유지
  // 추후 restoreFromStorage 확장 시 decompress 사용 가능

  // 그리기 시작
  const handleMouseDown = useCallback(
    (e: any) => {
      if (!isEditingActive) return; // 편집 비활성화 상태에서는 그리기 불가
      if (currentStep < 0 || currentStep >= DRAWING_STEPS.length) return;

      setIsDrawing(true);
      const pos = e.target.getStage().getPointerPosition();
      if (!pos) return;
      const newLine = {
        id: Date.now(),
        points: [pos.x, pos.y],
        stroke: isEraser ? 'rgba(0,0,0,1)' : brushColor,
        strokeWidth: brushSize,
        globalCompositeOperation: isEraser ? 'destination-out' : 'source-over',
      };

      const newStepsLines = [...stepsLines];
      newStepsLines[currentStep] = [...currentLines, newLine];
      setStepsLines(newStepsLines);

      // 새 선이 시작되면 redo 스택은 초기화 (현재 단계)
      const newRedo = [...redoStacks];
      newRedo[currentStep] = [];
      setRedoStacks(newRedo);
    },
    [
      currentStep,
      stepsLines,
      currentLines,
      brushColor,
      brushSize,
      isEraser,
      isEditingActive,
      redoStacks,
    ]
  );

  // 그리기 중
  const handleMouseMove = useCallback(
    (e: any) => {
      if (
        !isDrawing ||
        !isEditingActive ||
        currentStep < 0 ||
        currentStep >= DRAWING_STEPS.length
      )
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
    if (!isEditingActive) return;
    setIsDrawing(false);

    // 히스토리에 현재 상태 저장 (실행취소용) - 전체 스냅샷
    const newHistory = [...history];
    const currentStepLines = stepsLines[currentStep];
    if (currentStepLines) {
      newHistory[currentStep] = [...currentStepLines];
      setHistory(newHistory);
    }
  }, [history, currentStep, stepsLines, isEditingActive]);

  // 실행취소
  const handleUndo = useCallback(() => {
    if (currentLines.length === 0) return;
    const newStepsLines = [...stepsLines];
    const currentStepArr = newStepsLines[currentStep] || [];
    const removed = currentStepArr[currentStepArr.length - 1];
    newStepsLines[currentStep] = currentLines.slice(0, -1);
    setStepsLines(newStepsLines);
    if (removed) {
      const newRedo = [...redoStacks];
      const currRedo = newRedo[currentStep] || [];
      newRedo[currentStep] = [...currRedo, removed];
      setRedoStacks(newRedo);
    }
  }, [currentLines, stepsLines, currentStep, redoStacks]);

  const handleRedo = useCallback(() => {
    const redoStack = redoStacks[currentStep];
    if (!redoStack || redoStack.length === 0) return;
    const newRedo = [...redoStacks];
    const currentRedoArr = newRedo[currentStep] || [];
    const restored = currentRedoArr[currentRedoArr.length - 1];
    if (!restored) return;
    newRedo[currentStep] = currentRedoArr.slice(0, -1);
    setRedoStacks(newRedo);
    const newStepsLines = [...stepsLines];
    const currLines = newStepsLines[currentStep] || [];
    newStepsLines[currentStep] = [...currLines, restored];
    setStepsLines(newStepsLines);
  }, [redoStacks, currentStep, stepsLines]);

  // 현재 캔버스 지우기
  const handleClear = useCallback(() => {
    const newStepsLines = [...stepsLines];
    newStepsLines[currentStep] = [];
    setStepsLines(newStepsLines);

    const newHistory = [...history];
    newHistory[currentStep] = [];
    setHistory(newHistory);

    const newRedo = [...redoStacks];
    newRedo[currentStep] = [];
    setRedoStacks(newRedo);
  }, [stepsLines, currentStep, history, redoStacks]);

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

      // 추가: 라인 데이터 압축 저장 (선 데이터 -> delta)
      try {
        const currentRawLines = stepsLines[currentStep] || [];
        if (currentRawLines.length > 0) {
          const compressed = compress(currentRawLines as any);
          const compressedKey = `DRAWING_COMPRESSED_${user.id}_${stepId}`;
          localStorage.setItem(compressedKey, compressed);
        }
      } catch (e) {
        console.warn('라인 압축 저장 실패:', e);
      }

      toast.success(`${currentStepData.title} 임시저장 완료!`);

      // 저장 후 편집 비활성화 / 헤더 복원
      setIsEditingActive(false);
      setShowColorOptions(false);
      setShowSizeOptions(false);
      setSaveAnimationKey(k => k + 1);

      // 포커스 재설정 (reduceMotion 고려)
      requestAnimationFrame(() => {
        reActivateButtonRef.current?.focus({ preventScroll: true });
      });
    } catch (error) {
      console.error('Save error:', error);

      if (error instanceof AuthenticationError) {
        toast.error(error.message);
      } else {
        toast.error('임시저장 중 오류가 발생했습니다.');
      }
    }
  }, [currentStep, user?.id, saveDrawing]);

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
  }, [isEditingActive]);

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

  // 팝오버 외부 클릭 닫기
  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      if (
        showSizeOptions &&
        sizePopoverRef.current &&
        !sizePopoverRef.current.contains(e.target as Node)
      ) {
        setShowSizeOptions(false);
      }
      if (
        showColorOptions &&
        colorPopoverRef.current &&
        !colorPopoverRef.current.contains(e.target as Node)
      ) {
        setShowColorOptions(false);
      }
    };
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, [showSizeOptions, showColorOptions]);

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

  // 썸네일 클릭 시 해당 단계 이동 + 편집 재활성화
  const handleThumbnailSelect = useCallback((index: number) => {
    if (index < 0 || index >= DRAWING_STEPS.length) return;
    setCurrentStep(index);
    // 단계 전환 직후 레이아웃 계산 후 편집 활성화
    setIsEditingActive(true);
    // 팝오버 초기화
    setShowColorOptions(false);
    setShowSizeOptions(false);
    // 지우개 상태 유지 (사용자 선택 존중)
  }, []);

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
                  <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4'>
                    <div>
                      <h1 className='text-2xl font-bold text-gray-900'>
                        {currentStepData.title}
                      </h1>
                      <p className='text-gray-600 mt-1'>
                        {currentStepData.description}
                      </p>
                    </div>
                    <div className='text-right'>
                      <div className='text-sm text-gray-500 mb-1'>
                        {currentStep + 1} / {DRAWING_STEPS.length}
                      </div>
                      <div className='w-40 h-2 bg-gray-200 rounded-full'>
                        <div
                          className='h-2 bg-yellow-500 rounded-full transition-all duration-300'
                          style={{
                            width: `${((currentStep + 1) / DRAWING_STEPS.length) * 100}%`,
                          }}
                        />
                      </div>
                      <div className='mt-3 grid grid-cols-2 gap-1'>
                        {DRAWING_STEPS.map((step, index) => {
                          const stepSaveState =
                            saveStates[step.id as DrawingCategory];
                          const isCurrent = index === currentStep;
                          return (
                            <div
                              key={step.id}
                              className='flex items-center gap-1 text-[11px]'
                            >
                              <span
                                className={`${isCurrent ? 'font-semibold text-yellow-600' : 'text-gray-500'} truncate`}
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
                  {/* 저장된 썸네일 프리뷰 (편집 비활성 상태에서) */}
                  <div className='mt-4 flex flex-wrap gap-4'>
                    {DRAWING_STEPS.map((step, idx) => {
                      const img = savedImages[step.id];
                      if (!img) return null;
                      const isActive = idx === currentStep;
                      return (
                        <div
                          key={step.id}
                          role='button'
                          tabIndex={0}
                          aria-label={`${step.title} 단계로 이동`}
                          onClick={() => handleThumbnailSelect(idx)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleThumbnailSelect(idx);
                            }
                          }}
                          className={`flex flex-col items-center w-24 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded-md ${isActive ? 'opacity-100' : 'opacity-80 hover:opacity-100'} transition`}
                        >
                          <div
                            className={`w-24 h-32 border rounded-md overflow-hidden bg-white shadow-sm flex items-center justify-center relative ${isActive ? 'border-yellow-500 ring-2 ring-yellow-300' : 'border-gray-300 group-hover:border-gray-400'}`}
                          >
                            <img
                              src={img}
                              alt={`${step.title} 임시저장 썸네일`}
                              className='w-full h-full object-contain'
                              loading='lazy'
                            />
                            <div className='absolute bottom-1 right-1 text-[10px] px-1.5 py-0.5 rounded bg-white/80 backdrop-blur border border-gray-200 text-gray-700'>
                              {idx + 1}
                            </div>
                          </div>
                          <span className='mt-1 text-[11px] text-gray-700 text-center line-clamp-2'>
                            {step.title}
                          </span>
                          <span className='sr-only'>
                            썸네일 클릭 시 해당 단계 편집 시작
                          </span>
                        </div>
                      );
                    })}
                  </div>
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
                  <div className='flex flex-wrap items-center gap-3'>
                    {/* 브러시/지우개 토글 */}
                    <div className='flex items-center gap-2'>
                      <Button
                        variant={isEraser ? 'outline' : 'secondary'}
                        size='sm'
                        onClick={() => setIsEraser(false)}
                        className='flex items-center gap-1'
                      >
                        <Pencil className='w-4 h-4' /> 펜
                      </Button>
                      <Button
                        variant={isEraser ? 'secondary' : 'outline'}
                        size='sm'
                        onClick={() => setIsEraser(true)}
                        className='flex items-center gap-1'
                      >
                        <Eraser className='w-4 h-4' /> 지우개
                      </Button>
                    </div>

                    {/* 크기 선택 팝오버 */}
                    <div className='relative' ref={sizePopoverRef}>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          setShowSizeOptions(p => !p);
                          setShowColorOptions(false);
                        }}
                      >
                        크기 {brushSize}px
                      </Button>
                      {showSizeOptions && (
                        <div className='absolute z-20 mt-2 bg-white border border-gray-200 rounded-md shadow-lg p-2 flex gap-2'>
                          {BRUSH_SIZES.map(size => (
                            <button
                              key={size}
                              onClick={() => {
                                setBrushSize(size);
                                setShowSizeOptions(false);
                              }}
                              className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs ${brushSize === size ? 'bg-yellow-100 border-yellow-500 font-semibold' : 'border-gray-300 hover:border-gray-400'}`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 색상 선택 팝오버 */}
                    <div className='relative' ref={colorPopoverRef}>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          setShowColorOptions(p => !p);
                          setShowSizeOptions(false);
                        }}
                      >
                        색상
                      </Button>
                      {showColorOptions && (
                        <div className='absolute z-20 mt-2 bg-white border border-gray-200 rounded-md shadow-lg p-2 grid grid-cols-5 gap-2 w-48'>
                          {COLOR_PALETTE.map(color => (
                            <button
                              key={color}
                              onClick={() => {
                                setBrushColor(color);
                                setShowColorOptions(false);
                              }}
                              style={{ backgroundColor: color }}
                              className={`w-8 h-8 rounded-full border-2 ${brushColor === color ? 'border-gray-800' : 'border-gray-300 hover:border-gray-400'}`}
                              title={color}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 실행취소 / 되돌리기 / 전체지우기 / 임시저장 */}
                    <div className='flex gap-2 ml-auto'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={handleUndo}
                        disabled={currentLines.length === 0}
                        className='flex items-center gap-1'
                      >
                        <Undo className='w-4 h-4' /> 실행취소
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={handleRedo}
                        disabled={redoStacks[currentStep]?.length === 0}
                        className='flex items-center gap-1'
                      >
                        <Redo className='w-4 h-4' /> 되돌리기
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={handleClear}
                        disabled={currentLines.length === 0}
                        className='flex items-center gap-1'
                      >
                        <Trash2 className='w-4 h-4' /> 지우기
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={handleSave}
                        disabled={currentLines.length === 0}
                        className='flex items-center gap-1'
                      >
                        <Save className='w-4 h-4' /> 임시저장
                      </Button>
                    </div>
                  </div>
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
