import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { DRAWING_STEPS } from '@/constants/drawing';
import type {
  DrawingCategory,
  DrawingLine,
  History,
  RedoStacks,
  SavedImages,
  StepLines,
} from '@/types/drawing';

interface DrawingState {
  // 현재 단계
  currentStep: number;

  // 각 단계별 선 데이터
  stepsLines: StepLines;

  // 실행취소를 위한 히스토리
  history: History;

  // Redo 스택
  redoStacks: RedoStacks;

  // 저장된 이미지들
  savedImages: Partial<SavedImages>;

  // 그리기 상태
  isDrawing: boolean;

  // 로딩 상태
  isSubmitting: boolean;
}

interface DrawingActions {
  // 단계 관리
  setCurrentStep: (step: number) => void;
  goToPrevStep: () => void;
  goToNextStep: () => void;

  // 선 데이터 관리
  setStepsLines: (lines: StepLines) => void;
  updateCurrentStepLines: (lines: DrawingLine[]) => void;
  addLineToCurrentStep: (line: DrawingLine) => void;
  updateLastLinePoints: (points: number[]) => void;

  // 히스토리 관리
  saveToHistory: () => void;

  // 실행취소/다시실행
  undo: () => void;
  redo: () => void;
  clearCurrentStep: () => void;

  // 이미지 관리
  setSavedImages: (images: Partial<SavedImages>) => void;
  updateSavedImage: (stepId: DrawingCategory, dataURL: string) => void;

  // 상태 관리
  setIsDrawing: (isDrawing: boolean) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;

  // 초기화
  resetDrawingState: () => void;
}

type DrawingStore = DrawingState & DrawingActions;

const initialState: DrawingState = {
  currentStep: 0,
  stepsLines: [[], [], [], []],
  history: [[], [], [], []],
  redoStacks: [[], [], [], []],
  savedImages: {},
  isDrawing: false,
  isSubmitting: false,
};

export const useDrawingStore = create<DrawingStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // 단계 관리
      setCurrentStep: step => {
        if (step >= 0 && step < DRAWING_STEPS.length) {
          set({ currentStep: step }, false, 'setCurrentStep');
        }
      },

      goToPrevStep: () => {
        const { currentStep } = get();
        if (currentStep > 0) {
          set({ currentStep: currentStep - 1 }, false, 'goToPrevStep');
        }
      },

      goToNextStep: () => {
        const { currentStep } = get();
        if (currentStep < DRAWING_STEPS.length - 1) {
          set({ currentStep: currentStep + 1 }, false, 'goToNextStep');
        }
      },

      // 선 데이터 관리
      setStepsLines: lines => {
        set({ stepsLines: lines }, false, 'setStepsLines');
      },

      updateCurrentStepLines: lines => {
        const { stepsLines, currentStep } = get();
        const newStepsLines = [...stepsLines];
        newStepsLines[currentStep] = lines;
        set({ stepsLines: newStepsLines }, false, 'updateCurrentStepLines');
      },

      addLineToCurrentStep: line => {
        const { stepsLines, currentStep, redoStacks } = get();
        const newStepsLines = [...stepsLines];
        const currentLines = newStepsLines[currentStep] || [];
        newStepsLines[currentStep] = [...currentLines, line];

        // 새 선이 시작되면 redo 스택 초기화
        const newRedoStacks = [...redoStacks];
        newRedoStacks[currentStep] = [];

        set(
          {
            stepsLines: newStepsLines,
            redoStacks: newRedoStacks,
          },
          false,
          'addLineToCurrentStep'
        );
      },

      updateLastLinePoints: points => {
        const { stepsLines, currentStep } = get();
        const newStepsLines = [...stepsLines];
        const currentStepLines = newStepsLines[currentStep];

        if (currentStepLines && currentStepLines.length > 0) {
          const lastLine = currentStepLines[currentStepLines.length - 1];
          if (lastLine) {
            lastLine.points = points;
            set({ stepsLines: newStepsLines }, false, 'updateLastLinePoints');
          }
        }
      },

      // 히스토리 관리
      saveToHistory: () => {
        const { stepsLines, currentStep, history } = get();
        const newHistory = [...history];
        const currentStepLines = stepsLines[currentStep];
        if (currentStepLines) {
          newHistory[currentStep] = [...currentStepLines];
          set({ history: newHistory }, false, 'saveToHistory');
        }
      },

      // 실행취소/다시실행
      undo: () => {
        const { stepsLines, currentStep, redoStacks } = get();
        const currentLines = stepsLines[currentStep] || [];
        if (currentLines.length === 0) return;

        const newStepsLines = [...stepsLines];
        const removed = currentLines[currentLines.length - 1];
        newStepsLines[currentStep] = currentLines.slice(0, -1);

        if (removed) {
          const newRedoStacks = [...redoStacks];
          const currentRedoStack = newRedoStacks[currentStep] || [];
          newRedoStacks[currentStep] = [...currentRedoStack, removed];

          set(
            {
              stepsLines: newStepsLines,
              redoStacks: newRedoStacks,
            },
            false,
            'undo'
          );
        }
      },

      redo: () => {
        const { stepsLines, currentStep, redoStacks } = get();
        const redoStack = redoStacks[currentStep];
        if (!redoStack || redoStack.length === 0) return;

        const newRedoStacks = [...redoStacks];
        const currentRedoStack = newRedoStacks[currentStep] || [];
        const restored = currentRedoStack[currentRedoStack.length - 1];
        if (!restored) return;

        newRedoStacks[currentStep] = currentRedoStack.slice(0, -1);

        const newStepsLines = [...stepsLines];
        const currentLines = newStepsLines[currentStep] || [];
        newStepsLines[currentStep] = [...currentLines, restored];

        set(
          {
            stepsLines: newStepsLines,
            redoStacks: newRedoStacks,
          },
          false,
          'redo'
        );
      },

      clearCurrentStep: () => {
        const { stepsLines, currentStep, history, redoStacks } = get();
        const newStepsLines = [...stepsLines];
        newStepsLines[currentStep] = [];

        const newHistory = [...history];
        newHistory[currentStep] = [];

        const newRedoStacks = [...redoStacks];
        newRedoStacks[currentStep] = [];

        set(
          {
            stepsLines: newStepsLines,
            history: newHistory,
            redoStacks: newRedoStacks,
          },
          false,
          'clearCurrentStep'
        );
      },

      // 이미지 관리
      setSavedImages: images => {
        set({ savedImages: images }, false, 'setSavedImages');
      },

      updateSavedImage: (stepId, dataURL) => {
        const { savedImages } = get();
        set(
          {
            savedImages: {
              ...savedImages,
              [stepId]: dataURL,
            },
          },
          false,
          'updateSavedImage'
        );
      },

      // 상태 관리
      setIsDrawing: isDrawing => {
        set({ isDrawing }, false, 'setIsDrawing');
      },

      setIsSubmitting: isSubmitting => {
        set({ isSubmitting }, false, 'setIsSubmitting');
      },

      // 초기화
      resetDrawingState: () => {
        set(initialState, false, 'resetDrawingState');
      },
    }),
    { name: 'drawing-store' }
  )
);

// 현재 단계의 선들을 가져오는 셀렉터
export const useCurrentStepLines = () =>
  useDrawingStore(state => state.stepsLines[state.currentStep] || []);

// 현재 단계의 redo 스택을 가져오는 셀렉터
export const useCurrentRedoStack = () =>
  useDrawingStore(state => state.redoStacks[state.currentStep] || []);
