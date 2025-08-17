import { useGlobalFontLoading } from '@/hooks/useFontLoading';

interface FontLoadingIndicatorProps {
  children: React.ReactNode;
  showIndicator?: boolean;
}

/**
 * 폰트 로딩 상태를 추적하고 시각적 피드백을 제공하는 컴포넌트
 * @param children 자식 컴포넌트
 * @param showIndicator 로딩 인디케이터 표시 여부
 */
export const FontLoadingIndicator = ({
  children,
  showIndicator = false,
}: FontLoadingIndicatorProps) => {
  const fontsLoaded = useGlobalFontLoading();

  if (showIndicator && !fontsLoaded) {
    return (
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm'>
        <div className='flex flex-col items-center space-y-4'>
          <div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent'></div>
          <p className='text-sm text-muted-foreground'>폰트 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`transition-opacity duration-300 ${
        fontsLoaded ? 'opacity-100' : 'opacity-80'
      }`}
    >
      {children}
    </div>
  );
};
