import { memo, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { Button } from '@/components/ui/interactive/button';
import { BRUSH_SIZES, COLOR_PALETTE } from '@/constants/drawing';
import { useDrawingStore } from '@/stores/useDrawingStore';
import { useUIStore } from '@/stores/useUIStore';
import { Eraser, Pencil, Redo, Save, Trash2, Undo } from 'lucide-react';

interface DrawingToolbarProps {
  sizePopoverRef: React.RefObject<HTMLDivElement | null>;
  colorPopoverRef: React.RefObject<HTMLDivElement | null>;
  handleSave: () => void;
}

const DrawingToolbar = memo(
  ({ sizePopoverRef, colorPopoverRef, handleSave }: DrawingToolbarProps) => {
    // 스토어에서 필요한 상태들을 useShallow로 최적화하여 가져오기
    const {
      isEraser,
      showSizeOptions,
      showColorOptions,
      brushSize,
      brushColor,
      setIsEraser,
      setShowSizeOptions,
      setShowColorOptions,
      setBrushSize,
      setBrushColor,
    } = useUIStore(
      useShallow(state => ({
        isEraser: state.isEraser,
        showSizeOptions: state.showSizeOptions,
        showColorOptions: state.showColorOptions,
        brushSize: state.brushSize,
        brushColor: state.brushColor,
        setIsEraser: state.setIsEraser,
        setShowSizeOptions: state.setShowSizeOptions,
        setShowColorOptions: state.setShowColorOptions,
        setBrushSize: state.setBrushSize,
        setBrushColor: state.setBrushColor,
      }))
    );

    const {
      currentStep,
      stepsLines,
      redoStacks,
      undo,
      redo,
      clearCurrentStep,
    } = useDrawingStore(
      useShallow(state => ({
        currentStep: state.currentStep,
        stepsLines: state.stepsLines,
        redoStacks: state.redoStacks,
        undo: state.undo,
        redo: state.redo,
        clearCurrentStep: state.clearCurrentStep,
      }))
    );

    // 현재 단계의 선들
    const currentLines = stepsLines[currentStep] || [];

    // 메모이즈된 핸들러들
    const handleUndo = useCallback(() => {
      undo();
    }, [undo]);

    const handleRedo = useCallback(() => {
      redo();
    }, [redo]);

    const handleClear = useCallback(() => {
      clearCurrentStep();
    }, [clearCurrentStep]);

    const handleToolToggle = useCallback(
      (isEraserMode: boolean) => {
        setIsEraser(isEraserMode);
      },
      [setIsEraser]
    );

    const handleSizeSelect = useCallback(
      (size: number) => {
        setBrushSize(size);
        setShowSizeOptions(false);
      },
      [setBrushSize, setShowSizeOptions]
    );

    const handleColorSelect = useCallback(
      (color: string) => {
        setBrushColor(color);
        setShowColorOptions(false);
      },
      [setBrushColor, setShowColorOptions]
    );

    const toggleSizeOptions = useCallback(() => {
      setShowSizeOptions((prev: boolean) => !prev);
      setShowColorOptions(false);
    }, [setShowSizeOptions, setShowColorOptions]);

    const toggleColorOptions = useCallback(() => {
      setShowColorOptions((prev: boolean) => !prev);
      setShowSizeOptions(false);
    }, [setShowColorOptions, setShowSizeOptions]);
    return (
      <div className='flex flex-wrap items-center gap-3'>
        {/* 브러시/지우개 토글 */}
        <div className='flex items-center gap-2'>
          <Button
            variant={isEraser ? 'outline' : 'secondary'}
            size='sm'
            onClick={() => handleToolToggle(false)}
            className='flex items-center gap-1'
          >
            <Pencil className='w-4 h-4' /> 펜
          </Button>
          <Button
            variant={isEraser ? 'secondary' : 'outline'}
            size='sm'
            onClick={() => handleToolToggle(true)}
            className='flex items-center gap-1'
          >
            <Eraser className='w-4 h-4' /> 지우개
          </Button>
        </div>

        {/* 크기 선택 팝오버 */}
        <div className='relative' ref={sizePopoverRef}>
          <Button variant='outline' size='sm' onClick={toggleSizeOptions}>
            크기 {brushSize}px
          </Button>
          {showSizeOptions && (
            <div className='absolute z-20 mt-2 bg-white border border-gray-200 rounded-md shadow-lg p-2 flex gap-2'>
              {BRUSH_SIZES.map(size => (
                <button
                  key={size}
                  onClick={() => handleSizeSelect(size)}
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
          <Button variant='outline' size='sm' onClick={toggleColorOptions}>
            색상
          </Button>
          {showColorOptions && (
            <div className='absolute z-20 mt-2 bg-white border border-gray-200 rounded-md shadow-lg p-2 grid grid-cols-5 gap-2 w-48'>
              {COLOR_PALETTE.map(color => (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
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
    );
  }
);

DrawingToolbar.displayName = 'DrawingToolbar';

export { DrawingToolbar };
