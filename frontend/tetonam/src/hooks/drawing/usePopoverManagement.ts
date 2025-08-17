import { useEffect } from 'react';

interface UsePopoverManagementProps {
  showSizeOptions: boolean;
  showColorOptions: boolean;
  sizePopoverRef: React.RefObject<HTMLDivElement | null>;
  colorPopoverRef: React.RefObject<HTMLDivElement | null>;
  closeAllPopovers: () => void;
}

/**
 * 팝오버 외부 클릭 감지 및 닫기 처리를 담당하는 커스텀 훅
 */
export const usePopoverManagement = ({
  showSizeOptions,
  showColorOptions,
  sizePopoverRef,
  colorPopoverRef,
  closeAllPopovers,
}: UsePopoverManagementProps) => {
  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node;

      // 크기 팝오버 외부 클릭 체크
      if (
        showSizeOptions &&
        sizePopoverRef.current &&
        !sizePopoverRef.current.contains(target)
      ) {
        closeAllPopovers();
        return;
      }

      // 색상 팝오버 외부 클릭 체크
      if (
        showColorOptions &&
        colorPopoverRef.current &&
        !colorPopoverRef.current.contains(target)
      ) {
        closeAllPopovers();
        return;
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);

    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, [
    showSizeOptions,
    showColorOptions,
    sizePopoverRef,
    colorPopoverRef,
    closeAllPopovers,
  ]);
};
