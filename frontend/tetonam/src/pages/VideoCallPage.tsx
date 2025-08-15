import { VideoCall } from '@/components/video/VideoCall';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useMemo } from 'react';

export const VideoCallPage = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // 🎯 사용자 역할 메모이제이션 (성능 최적화)
  const isCounselor = useMemo(() => {
    return user?.roles?.includes('COUNSELOR') ?? false;
  }, [user?.roles]);

  if (!appointmentId) {
    return (
      <div className='flex items-center justify-center h-screen bg-background'>
        <div className='text-center'>
          <h2 className='text-lg font-semibold text-foreground mb-2'>
            잘못된 접근입니다
          </h2>
          <p className='text-muted-foreground mb-4'>
            올바른 상담 링크를 통해 접근해주세요.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className='px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90'
          >
            대시보드로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const handleEndCall = () => {
    navigate('/dashboard');
  };

  return (
    <VideoCall 
      appointmentId={appointmentId} 
      onEnd={handleEndCall} 
      isCounselor={isCounselor}
    />
  );
};
