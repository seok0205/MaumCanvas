import { createContext, useContext, useCallback, useMemo, ReactNode } from 'react';
import { useState } from 'react';

// TypeScript 인터페이스 정의
interface ImageModalData {
  imageId: number;
  imageUrl: string;
  category: string;
}

interface ImageModalContextValue {
  isOpen: boolean;
  modalData: ImageModalData | null;
  inVideoCall: boolean;
  openModal: (data: ImageModalData) => void;
  closeModal: () => void;
}

interface ImageModalProviderProps {
  children: ReactNode;
  inVideoCall?: boolean; // 화상상담 중인지 여부
}

// Context 생성
const ImageModalContext = createContext<ImageModalContextValue | null>(null);

// Provider 컴포넌트 (React Best Practice 적용)
export const ImageModalProvider = ({ children, inVideoCall = false }: ImageModalProviderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalData, setModalData] = useState<ImageModalData | null>(null);

  // useCallback으로 함수 메모이제이션 (성능 최적화)
  const openModal = useCallback((data: ImageModalData) => {
    setModalData(data);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setModalData(null);
  }, []);

  // useMemo로 context value 메모이제이션 (불필요한 리렌더링 방지)
  const contextValue = useMemo(() => ({
    isOpen,
    modalData,
    inVideoCall,
    openModal,
    closeModal,
  }), [isOpen, modalData, inVideoCall, openModal, closeModal]);

  return (
    <ImageModalContext.Provider value={contextValue}>
      {children}
    </ImageModalContext.Provider>
  );
};

// Custom Hook for Context 사용 (타입 안전성 보장)
export const useImageModal = (): ImageModalContextValue => {
  const context = useContext(ImageModalContext);

  if (!context) {
    throw new Error(
      'useImageModal must be used within an ImageModalProvider'
    );
  }

  return context;
};

// 타입 export
export type { ImageModalData, ImageModalContextValue };
