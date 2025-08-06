import { cn } from '@/utils/cn';
import { useEffect, useRef, useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  delay?: number;
}

export const Tooltip = ({
  content,
  children,
  position = 'top',
  className,
  delay = 200,
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      updateTooltipPosition();
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsVisible(false);
  };

  const updateTooltipPosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - 8;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + 8;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + 8;
        break;
    }

    // 화면 경계 체크 및 조정
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    if (left < 8) left = 8;
    if (left + tooltipRect.width > viewport.width - 8) {
      left = viewport.width - tooltipRect.width - 8;
    }
    if (top < 8) top = 8;
    if (top + tooltipRect.height > viewport.height - 8) {
      top = viewport.height - tooltipRect.height - 8;
    }

    setTooltipStyle({
      position: 'fixed',
      top,
      left,
      zIndex: 1000,
    });
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      updateTooltipPosition();
    }
  }, [isVisible, position]);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className='inline-block'
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          style={tooltipStyle}
          className={cn(
            'px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-lg',
            'max-w-xs break-words transition-opacity duration-200',
            'border border-gray-700',
            className
          )}
          role='tooltip'
          aria-live='polite'
        >
          {content}

          {/* 화살표 */}
          <div
            className={cn(
              'absolute w-2 h-2 bg-gray-900 border border-gray-700 transform rotate-45',
              {
                'bottom-[-5px] left-1/2 -translate-x-1/2 border-t-0 border-l-0':
                  position === 'top',
                'top-[-5px] left-1/2 -translate-x-1/2 border-b-0 border-r-0':
                  position === 'bottom',
                'right-[-5px] top-1/2 -translate-y-1/2 border-t-0 border-l-0':
                  position === 'left',
                'left-[-5px] top-1/2 -translate-y-1/2 border-b-0 border-r-0':
                  position === 'right',
              }
            )}
          />
        </div>
      )}
    </>
  );
};
