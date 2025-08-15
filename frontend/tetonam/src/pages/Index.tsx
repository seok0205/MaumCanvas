import { useRedirectLogic } from '@/hooks/useRedirectLogic';
import { LoadingAnimation } from '@/components/ui/LoadingAnimation';

export const Index = () => {
  useRedirectLogic();

  // 리다이렉트하는 동안 로딩 화면 표시
  return (
    <div className='min-h-screen bg-gradient-to-br from-mint/10 via-yellow/5 to-light-blue/10 flex items-center justify-center overflow-hidden'>
      <div className='text-center animate-fade-in'>
        <LoadingAnimation
          size="lg"
          title="마음 캔버스 ✨"
          message="창의적인 마음의 여행을 준비하고 있어요... 🌈"
          showLoadingDots={true}
        />
      </div>
    </div>
  );
};
