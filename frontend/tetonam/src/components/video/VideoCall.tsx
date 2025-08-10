import { Button } from '@/components/ui/interactive/button';
import { useAgoraClient } from '@/hooks/useAgoraClient';
import { agoraService } from '@/services/agoraService';
import { Loader2, Mic, MicOff, PhoneOff, Video, VideoOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface VideoCallProps {
  appointmentId: string;
  onEnd: () => void;
}

export const VideoCall = ({ appointmentId, onEnd }: VideoCallProps) => {
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);

  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

  const {
    isConnecting,
    isConnected,
    localVideoTrack,
    remoteUsers,
    error,
    join,
    leave,
    toggleAudio,
    toggleVideo,
  } = useAgoraClient();

  useEffect(() => {
    let cancelled = false;
    const initialize = async () => {
      try {
        // NOTE: 백엔드 스펙에 맞춰 counselingId=appointmentId, userId는 로그인 사용자 기준 필요
        // 현재 store의 사용자 id가 문자열이므로 숫자 기반 uid 필요 시 파싱 또는 서버에서 수신 가능 형태 유지
        const uidCandidate =
          Number((window as any).__CURRENT_USER_ID__ ?? '0') || 0;
        const tokenData = await agoraService.getToken(
          appointmentId,
          uidCandidate
        );
        if (cancelled) return;
        await join({
          appId: import.meta.env['VITE_AGORA_APP_ID'] as string,
          channel: tokenData.channel,
          token: tokenData.token,
          uid: Number(tokenData.uid),
        });
      } catch (e) {
        console.error('화상 통화 초기화 실패:', e);
      }
    };
    initialize();
    return () => {
      cancelled = true;
      // 방 정리만 수행 (세션 관련 백엔드 호출 제거)
      leave();
    };
  }, [appointmentId, join]);

  useEffect(() => {
    if (localVideoTrack && localVideoRef.current) {
      localVideoTrack.play(localVideoRef.current);
    }
  }, [localVideoTrack]);

  useEffect(() => {
    const remoteUser = Array.from(remoteUsers.values())[0];
    if (remoteUser?.videoTrack && remoteVideoRef.current) {
      remoteUser.videoTrack.play(remoteVideoRef.current);
    }
  }, [remoteUsers]);

  const handleEndCall = async () => {
    try {
      await leave();
      onEnd();
    } catch (e) {
      console.error('통화 종료 실패:', e);
    }
  };

  const handleToggleAudio = async () => {
    await toggleAudio(!isAudioOn);
    setIsAudioOn(prev => !prev);
  };

  const handleToggleVideo = async () => {
    await toggleVideo(!isVideoOn);
    setIsVideoOn(prev => !prev);
  };

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center h-screen bg-background'>
        <p className='text-destructive mb-4'>연결 오류: {error}</p>
        <Button onClick={onEnd}>돌아가기</Button>
      </div>
    );
  }

  return (
    <div className='relative h-screen bg-black'>
      <div ref={remoteVideoRef} className='w-full h-full' />
      <div
        ref={localVideoRef}
        className='absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg shadow-lg overflow-hidden'
      />

      {isConnecting && (
        <div className='absolute inset-0 flex items-center justify-center bg-black/50'>
          <Loader2 className='w-8 h-8 text-white animate-spin' />
          <span className='ml-2 text-white'>연결 중...</span>
        </div>
      )}

      {isConnected && (
        <div className='absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 p-4 bg-black/50 rounded-full'>
          <Button
            size='icon'
            variant={isAudioOn ? 'secondary' : 'destructive'}
            onClick={handleToggleAudio}
            className='rounded-full'
            aria-label={isAudioOn ? '마이크 끄기' : '마이크 켜기'}
          >
            {isAudioOn ? <Mic /> : <MicOff />}
          </Button>
          <Button
            size='icon'
            variant={isVideoOn ? 'secondary' : 'destructive'}
            onClick={handleToggleVideo}
            className='rounded-full'
            aria-label={isVideoOn ? '카메라 끄기' : '카메라 켜기'}
          >
            {isVideoOn ? <Video /> : <VideoOff />}
          </Button>
          <Button
            size='icon'
            variant='destructive'
            onClick={handleEndCall}
            className='rounded-full'
            aria-label='통화 종료'
          >
            <PhoneOff />
          </Button>
        </div>
      )}
    </div>
  );
};
