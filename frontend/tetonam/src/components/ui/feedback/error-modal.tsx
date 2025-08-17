import { useEffect } from 'react';

import { Button } from '@/components/ui/interactive/button';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'error' | 'success';
}

export const ErrorModal = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'error',
}: ErrorModalProps) => {
  // ✅ ESC 키로 모달 닫기 (접근성 개선)
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // ✅ 포커스 트랩 (접근성 개선)
  useEffect(() => {
    if (!isOpen) return;

    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          event.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          event.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
      role='dialog'
      aria-modal='true'
      aria-labelledby='modal-title'
      aria-describedby='modal-description'
    >
      <div className='bg-white rounded-lg p-6 max-w-md w-full shadow-lg'>
        <div className='flex items-center gap-3 mb-4'>
          {type === 'error' ? (
            <AlertTriangle
              className='h-6 w-6 text-red-500'
              aria-hidden='true'
            />
          ) : (
            <CheckCircle
              className='h-6 w-6 text-green-500'
              aria-hidden='true'
            />
          )}
          <h3
            id='modal-title'
            className={`text-lg font-semibold ${
              type === 'error' ? 'text-red-800' : 'text-green-800'
            }`}
          >
            {title}
          </h3>
        </div>
        <p
          id='modal-description'
          className='text-gray-700 mb-6 leading-relaxed'
        >
          {message}
        </p>
        <div className='flex justify-end'>
          <Button onClick={onClose} className='px-6' autoFocus>
            확인
          </Button>
        </div>
      </div>
    </div>
  );
};
