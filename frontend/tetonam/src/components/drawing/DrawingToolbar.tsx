import { Button } from '@/components/ui/interactive/button';
import { BRUSH_SIZES, COLOR_PALETTE } from '@/constants/drawing';
import { Eraser, Pencil, Redo, Save, Trash2, Undo } from 'lucide-react';
import React from 'react';

interface DrawingToolbarProps {
  isEraser: boolean;
  setIsEraser: (value: boolean) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  brushColor: string;
  setBrushColor: (color: string) => void;
  showSizeOptions: boolean;
  setShowSizeOptions: (value: boolean | ((prev: boolean) => boolean)) => void;
  showColorOptions: boolean;
  setShowColorOptions: (value: boolean | ((prev: boolean) => boolean)) => void;
  sizePopoverRef: React.RefObject<HTMLDivElement | null>;
  colorPopoverRef: React.RefObject<HTMLDivElement | null>;
  handleUndo: () => void;
  handleRedo: () => void;
  handleClear: () => void;
  handleSave: () => void;
  currentLines: any[];
  redoStacks: any[];
  currentStep: number;
}

const DrawingToolbar = ({
  isEraser,
  setIsEraser,
  brushSize,
  setBrushSize,
  brushColor,
  setBrushColor,
  showSizeOptions,
  setShowSizeOptions,
  showColorOptions,
  setShowColorOptions,
  sizePopoverRef,
  colorPopoverRef,
  handleUndo,
  handleRedo,
  handleClear,
  handleSave,
  currentLines,
  redoStacks,
  currentStep,
}: DrawingToolbarProps) => {
  return (
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
  );
};

export default DrawingToolbar;
