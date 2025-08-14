import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

import { CANVAS_CONFIG, COLOR_PALETTE } from '@/constants/drawing';
import type { DrawingColor, PenSettings, StageSize } from '@/types/drawing';

interface UIState {
  // 편집 모드
  isEditingActive: boolean;

  // 팝오버 상태
  showSizeOptions: boolean;
  showColorOptions: boolean;

  // 도구 설정
  isEraser: boolean;
  brushSize: number;
  brushColor: DrawingColor;

  // 캔버스 크기
  stageSize: StageSize;

  // 애니메이션
  saveAnimationKey: number;

  // 터치펜 설정
  penSettings: PenSettings;
  isPenActive: boolean;
  activePenPointerId: number | null;
}

interface UIActions {
  // 편집 모드 관리
  setIsEditingActive: (active: boolean) => void;
  activateEditing: () => void;
  deactivateEditing: () => void;

  // 팝오버 관리
  setShowSizeOptions: (show: boolean | ((prev: boolean) => boolean)) => void;
  setShowColorOptions: (show: boolean | ((prev: boolean) => boolean)) => void;
  toggleSizeOptions: () => void;
  toggleColorOptions: () => void;
  closeAllPopovers: () => void;

  // 도구 설정
  setIsEraser: (isEraser: boolean) => void;
  setBrushSize: (size: number) => void;
  setBrushColor: (color: string) => void;
  toggleEraser: () => void;

  // 캔버스 크기
  setStageSize: (size: StageSize) => void;

  // 애니메이션
  triggerSaveAnimation: () => void;

  // 터치펜 관리
  setPenSettings: (settings: Partial<PenSettings>) => void;
  setIsPenActive: (active: boolean) => void;
  setActivePenPointerId: (pointerId: number | null) => void;
  calculateDynamicStrokeWidth: (
    baseBrushSize: number,
    pressure: number
  ) => number;

  // 초기화
  resetUIState: () => void;
}

type UIStore = UIState & UIActions;

const initialState: UIState = {
  isEditingActive: false,
  showSizeOptions: false,
  showColorOptions: false,
  isEraser: false,
  brushSize: CANVAS_CONFIG.DEFAULT_BRUSH_SIZE,
  brushColor: COLOR_PALETTE[0] as DrawingColor,
  stageSize: {
    width: CANVAS_CONFIG.WIDTH,
    height: CANVAS_CONFIG.HEIGHT,
  },
  saveAnimationKey: 0,
  // 터치펜 설정 초기값 (태블릿 최적화)
  penSettings: {
    pressureSensitivity: true,
    touchRejection: false, // 태블릿에서 기본적으로 비활성화
    pressureMultiplier: 1.0,
  },
  isPenActive: false,
  activePenPointerId: null,
};

export const useUIStore = create<UIStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // 편집 모드 관리
      setIsEditingActive: active => {
        set({ isEditingActive: active }, false, 'setIsEditingActive');
      },

      activateEditing: () => {
        set(
          {
            isEditingActive: true,
            showSizeOptions: false,
            showColorOptions: false,
          },
          false,
          'activateEditing'
        );
      },

      deactivateEditing: () => {
        set(
          {
            isEditingActive: false,
            showSizeOptions: false,
            showColorOptions: false,
          },
          false,
          'deactivateEditing'
        );
      },

      // 팝오버 관리
      setShowSizeOptions: show => {
        if (typeof show === 'function') {
          const { showSizeOptions } = get();
          set(
            { showSizeOptions: show(showSizeOptions) },
            false,
            'setShowSizeOptions'
          );
        } else {
          set({ showSizeOptions: show }, false, 'setShowSizeOptions');
        }
      },

      setShowColorOptions: show => {
        if (typeof show === 'function') {
          const { showColorOptions } = get();
          set(
            { showColorOptions: show(showColorOptions) },
            false,
            'setShowColorOptions'
          );
        } else {
          set({ showColorOptions: show }, false, 'setShowColorOptions');
        }
      },

      toggleSizeOptions: () => {
        const { showSizeOptions } = get();
        set(
          {
            showSizeOptions: !showSizeOptions,
            showColorOptions: false, // 다른 팝오버 닫기
          },
          false,
          'toggleSizeOptions'
        );
      },

      toggleColorOptions: () => {
        const { showColorOptions } = get();
        set(
          {
            showColorOptions: !showColorOptions,
            showSizeOptions: false, // 다른 팝오버 닫기
          },
          false,
          'toggleColorOptions'
        );
      },

      closeAllPopovers: () => {
        set(
          {
            showSizeOptions: false,
            showColorOptions: false,
          },
          false,
          'closeAllPopovers'
        );
      },

      // 도구 설정
      setIsEraser: isEraser => {
        set({ isEraser }, false, 'setIsEraser');
      },

      setBrushSize: size => {
        set({ brushSize: size }, false, 'setBrushSize');
      },

      setBrushColor: color => {
        set({ brushColor: color as DrawingColor }, false, 'setBrushColor');
      },

      toggleEraser: () => {
        const { isEraser } = get();
        set({ isEraser: !isEraser }, false, 'toggleEraser');
      },

      // 캔버스 크기
      setStageSize: size => {
        set({ stageSize: size }, false, 'setStageSize');
      },

      // 애니메이션
      triggerSaveAnimation: () => {
        const { saveAnimationKey } = get();
        set(
          { saveAnimationKey: saveAnimationKey + 1 },
          false,
          'triggerSaveAnimation'
        );
      },

      // 터치펜 관리
      setPenSettings: settings => {
        const { penSettings } = get();
        set(
          { penSettings: { ...penSettings, ...settings } },
          false,
          'setPenSettings'
        );
      },

      setIsPenActive: active => {
        set({ isPenActive: active }, false, 'setIsPenActive');
      },

      setActivePenPointerId: pointerId => {
        set({ activePenPointerId: pointerId }, false, 'setActivePenPointerId');
      },

      calculateDynamicStrokeWidth: (baseBrushSize, pressure) => {
        const { penSettings } = get();
        if (!penSettings.pressureSensitivity) {
          return baseBrushSize;
        }

        // 압력 값은 0~1 범위, 기본값 0.5
        const normalizedPressure = Math.max(
          0.1,
          Math.min(1.0, pressure || 0.5)
        );
        const pressureMultiplier = penSettings.pressureMultiplier;

        // 최소 20%, 최대 150%의 브러시 크기 변화
        const minScale = 0.2;
        const maxScale = 1.5;
        const scale =
          minScale +
          normalizedPressure * (maxScale - minScale) * pressureMultiplier;

        return Math.round(baseBrushSize * scale);
      },

      // 초기화
      resetUIState: () => {
        set(initialState, false, 'resetUIState');
      },
    }),
    { name: 'ui-store' }
  )
);

// 도구 관련 셀렉터들
export const useBrushSettings = () =>
  useUIStore(
    useShallow(state => ({
      isEraser: state.isEraser,
      brushSize: state.brushSize,
      brushColor: state.brushColor,
    }))
  );

export const usePopoverStates = () =>
  useUIStore(
    useShallow(state => ({
      showSizeOptions: state.showSizeOptions,
      showColorOptions: state.showColorOptions,
    }))
  );

// 터치펜 관련 셀렉터들
export const usePenSettings = () =>
  useUIStore(
    useShallow(state => ({
      penSettings: state.penSettings,
      isPenActive: state.isPenActive,
      activePenPointerId: state.activePenPointerId,
      calculateDynamicStrokeWidth: state.calculateDynamicStrokeWidth,
      setPenSettings: state.setPenSettings,
      setIsPenActive: state.setIsPenActive,
      setActivePenPointerId: state.setActivePenPointerId,
    }))
  );
