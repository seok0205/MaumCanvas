import { Pen, Settings, Shield, Zap } from 'lucide-react';
import { memo, useState } from 'react';

import { Button } from '@/components/ui/interactive/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/overlay/popover';
import { usePenSettings } from '@/stores/useUIStore';

/**
 * 터치펜 설정 컴포넌트
 * 압력 감지, 터치 거부, 기울기 감지 등의 설정을 제공
 */
const PenSettings = memo(() => {
  const { penSettings, setPenSettings } = usePenSettings();

  const [isOpen, setIsOpen] = useState(false);

  const handlePressureSensitivityChange = () => {
    setPenSettings({ pressureSensitivity: !penSettings.pressureSensitivity });
  };

  const handleTouchRejectionChange = () => {
    setPenSettings({ touchRejection: !penSettings.touchRejection });
  };

  const handleTiltSensitivityChange = () => {
    setPenSettings({ tiltSensitivity: !penSettings.tiltSensitivity });
  };

  const handlePressureMultiplierChange = (direction: 'up' | 'down') => {
    const step = 0.1;
    const current = penSettings.pressureMultiplier;
    const newValue =
      direction === 'up'
        ? Math.min(2.0, current + step)
        : Math.max(0.1, current - step);
    setPenSettings({ pressureMultiplier: Math.round(newValue * 10) / 10 });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm'
          title='터치펜 설정'
        >
          <Settings className='w-4 h-4' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-80 p-4 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg'>
        <div className='space-y-4'>
          <div className='flex items-center gap-2 mb-4'>
            <Pen className='w-4 h-4 text-blue-600' />
            <h3 className='font-medium text-gray-900'>터치펜 설정</h3>
          </div>

          {/* 압력 감지 */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Zap className='w-4 h-4 text-orange-500' />
                <span className='text-sm font-medium text-gray-700'>
                  압력 감지
                </span>
              </div>
              <button
                onClick={handlePressureSensitivityChange}
                className={`w-12 h-6 rounded-full transition-colors ${
                  penSettings.pressureSensitivity
                    ? 'bg-blue-600'
                    : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    penSettings.pressureSensitivity
                      ? 'translate-x-6'
                      : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            <p className='text-xs text-gray-500 ml-6'>
              펜 압력에 따라 선 굵기가 변화합니다
            </p>

            {/* 압력 감도 조절 */}
            {penSettings.pressureSensitivity && (
              <div className='ml-6 space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs text-gray-600'>감도</span>
                  <span className='text-xs text-gray-500'>
                    {penSettings.pressureMultiplier.toFixed(1)}x
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => handlePressureMultiplierChange('down')}
                    disabled={penSettings.pressureMultiplier <= 0.1}
                  >
                    -
                  </Button>
                  <div className='flex-1 bg-gray-200 h-2 rounded'>
                    <div
                      className='bg-blue-600 h-2 rounded transition-all'
                      style={{
                        width: `${((penSettings.pressureMultiplier - 0.1) / (2.0 - 0.1)) * 100}%`,
                      }}
                    />
                  </div>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => handlePressureMultiplierChange('up')}
                    disabled={penSettings.pressureMultiplier >= 2.0}
                  >
                    +
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* 터치 거부 */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Shield className='w-4 h-4 text-green-500' />
                <span className='text-sm font-medium text-gray-700'>
                  터치 거부
                </span>
              </div>
              <button
                onClick={handleTouchRejectionChange}
                className={`w-12 h-6 rounded-full transition-colors ${
                  penSettings.touchRejection ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    penSettings.touchRejection
                      ? 'translate-x-6'
                      : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            <p className='text-xs text-gray-500 ml-6'>
              펜 사용 중 손바닥 터치를 무시합니다
            </p>
          </div>

          {/* 기울기 감지 */}
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <div className='w-4 h-4 bg-purple-500 rounded transform rotate-12' />
                <span className='text-sm font-medium text-gray-700'>
                  기울기 감지
                </span>
              </div>
              <button
                onClick={handleTiltSensitivityChange}
                className={`w-12 h-6 rounded-full transition-colors ${
                  penSettings.tiltSensitivity ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    penSettings.tiltSensitivity
                      ? 'translate-x-6'
                      : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            <p className='text-xs text-gray-500 ml-6'>
              펜 기울기에 따른 효과 (실험적 기능)
            </p>
          </div>

          {/* 안내 메시지 */}
          <div className='mt-4 pt-3 border-t border-gray-200'>
            <p className='text-xs text-gray-500 text-center'>
              ✨ 터치펜이나 스타일러스로 그리기에 최적화된 설정입니다
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
});

PenSettings.displayName = 'PenSettings';

export { PenSettings };
