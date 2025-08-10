import { VideoCall } from '@/components/video/VideoCall';
import { useNavigate, useParams } from 'react-router-dom';

export const VideoCallPage = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();

  if (!appointmentId) {
    return <div>잘못된 접근입니다.</div>;
  }

  const handleEndCall = () => {
    navigate('/dashboard');
  };

  return <VideoCall appointmentId={appointmentId} onEnd={handleEndCall} />;
};
