import { Button } from '@/components/ui/interactive/button';
import { RemoteUserStatusOverlay } from '@/components/video/RemoteUserStatusOverlay';
import { WaitingForConnection } from '@/components/video/WaitingForConnection';
import { useAgoraClient } from '@/hooks/useAgoraClient';
import { agoraService } from '@/services/agoraService';
import { useAuthStore } from '@/stores/useAuthStore';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { Loader2, Mic, MicOff, PhoneOff, Video, VideoOff } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface VideoCallProps {
  appointmentId: string;
  onEnd: () => void;
}

export const VideoCall = ({ appointmentId, onEnd }: VideoCallProps) => {
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const uidRef = useRef<number | null>(null);

  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

  const {
    isConnecting,
    isConnected,
    localVideoTrack,
    remoteUsers,
    error,
    waitingForUsers,
    networkQuality,
    join,
    leave,
    toggleAudio,
    toggleVideo,
  } = useAgoraClient();
  const { user } = useAuthStore();

  // 상대방 정보 상태 관리
  const remoteUser = Array.from(remoteUsers.values())[0];
  const hasRemoteUsers = remoteUsers.size > 0;

  useEffect(() => {
    let cancelled = false;
    const initialize = async () => {
      try {
        // 브라우저 호환성 체크 (Agora Best Practice)
        const isSupported = AgoraRTC.checkSystemRequirements();

        if (!isSupported) {
          throw new Error(
            '현재 브라우저는 Agora Web SDK를 지원하지 않습니다. 최신 버전의 Chrome, Firefox, Safari를 사용해주세요.'
          );
        }

        // uid 결정: 존재하면 사용, 없으면 양수 랜덤 생성(1..2^31-1)
        if (uidRef.current == null) {
          const fromStore = Number(user?.id ?? '0');
          uidRef.current =
            Number.isFinite(fromStore) && fromStore > 0
              ? Math.floor(fromStore)
              : null;
          if (uidRef.current == null) {
            throw new Error('로그인 사용자 numeric userId를 찾을 수 없습니다.');
          }
        }

        const tokenData = await agoraService.getToken(
          appointmentId,
          uidRef.current
        );

        if (cancelled) return;

        // 환경변수 접근 방식 통일 (dot notation 사용)
        const appId = import.meta.env.VITE_AGORA_APP_ID?.trim();

        if (!appId) {
          console.error(
            '❌ [VideoCall] VITE_AGORA_APP_ID 환경변수가 설정되지 않았습니다.'
          );
          console.error(
            '❌ [VideoCall] 환경변수 전체 목록:',
            Object.keys(import.meta.env)
          );
          throw new Error('VITE_AGORA_APP_ID 환경변수가 설정되지 않았습니다.');
        }

        await join({
          appId,
          channel: tokenData.channel,
          token: tokenData.token,
          uid: tokenData.uid ?? uidRef.current!,
        });
      } catch (e) {
        console.error('❌ [VideoCall] 화상 통화 초기화 실패:', e);
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
    if (remoteUser?.videoTrack && remoteVideoRef.current) {
      remoteUser.videoTrack.play(remoteVideoRef.current);
    }
  }, [remoteUser]);

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
      {/* 원격 비디오 영역 */}
      <div className='relative w-full h-full'>
        <div ref={remoteVideoRef} className='w-full h-full' />

        {/* 상대방 상태 오버레이 */}
        {hasRemoteUsers && remoteUser && remoteUser.userName ? (
          <RemoteUserStatusOverlay
            hasVideo={remoteUser.hasVideo ?? false}
            hasAudio={remoteUser.hasAudio ?? false}
            userName={remoteUser.userName}
            isVisible={hasRemoteUsers}
          />
        ) : null}

        {/* 상대방 음소거 상태 표시 (우상단) */}
        {hasRemoteUsers && !remoteUser?.hasAudio && (
          <div className='absolute top-4 left-4 flex items-center space-x-2 px-3 py-2 bg-red-600/90 rounded-full backdrop-blur-sm'>
            <MicOff className='w-4 h-4 text-white' />
            <span className='text-white text-sm font-medium'>
              상대방 음소거
            </span>
          </div>
        )}
      </div>

      {/* 로컬 비디오 (내 화면) - 우상단 */}
      <div className='absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg shadow-xl overflow-hidden border-2 border-white/20'>
        <div ref={localVideoRef} className='w-full h-full' />

        {/* 내 비디오가 꺼져있을 때 */}
        {!isVideoOn && (
          <div className='absolute inset-0 flex flex-col items-center justify-center bg-gray-800'>
            <VideoOff className='w-8 h-8 text-gray-400 mb-2' />
            <span className='text-gray-400 text-xs'>내 카메라 꺼짐</span>
          </div>
        )}

        {/* 내 음소거 상태 표시 */}
        {!isAudioOn && (
          <div className='absolute bottom-2 left-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center'>
            <MicOff className='w-3 h-3 text-white' />
          </div>
        )}
      </div>

      {/* 연결 대기 상태 오버레이 */}
      {typeof networkQuality === 'number' ? (
        <WaitingForConnection
          isConnecting={isConnecting}
          isConnected={isConnected}
          hasRemoteUsers={hasRemoteUsers}
          networkQuality={networkQuality}
        />
      ) : (
        <WaitingForConnection
          isConnecting={isConnecting}
          isConnected={isConnected}
          hasRemoteUsers={hasRemoteUsers}
        />
      )}

      {/* 상대방 대기 중일 때 추가 안내 */}
      {isConnected && waitingForUsers && !hasRemoteUsers && (
        <div className='absolute bottom-32 left-1/2 -translate-x-1/2 px-4 py-2 bg-blue-600/80 rounded-full backdrop-blur-sm'>
          <span className='text-white text-sm font-medium'>
            💬 상대방을 기다리는 중...
          </span>
        </div>
      )}

      {/* 연결 중 로딩 (기존 로직 유지) */}
      {isConnecting && (
        <div className='absolute inset-0 flex items-center justify-center bg-black/50'>
          <Loader2 className='w-8 h-8 text-white animate-spin' />
          <span className='ml-2 text-white'>연결 중...</span>
        </div>
      )}

      {/* 컨트롤 버튼들 */}
      {isConnected && (
        <div className='absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 p-4 bg-black/70 rounded-full backdrop-blur-sm'>
          <Button
            size='icon'
            variant={isAudioOn ? 'secondary' : 'destructive'}
            onClick={handleToggleAudio}
            className='rounded-full w-12 h-12'
            aria-label={isAudioOn ? '마이크 끄기' : '마이크 켜기'}
          >
            {isAudioOn ? (
              <Mic className='w-5 h-5' />
            ) : (
              <MicOff className='w-5 h-5' />
            )}
          </Button>
          <Button
            size='icon'
            variant={isVideoOn ? 'secondary' : 'destructive'}
            onClick={handleToggleVideo}
            className='rounded-full w-12 h-12'
            aria-label={isVideoOn ? '카메라 끄기' : '카메라 켜기'}
          >
            {isVideoOn ? (
              <Video className='w-5 h-5' />
            ) : (
              <VideoOff className='w-5 h-5' />
            )}
          </Button>
          <Button
            size='icon'
            variant='destructive'
            onClick={handleEndCall}
            className='rounded-full w-12 h-12 bg-red-600 hover:bg-red-700'
            aria-label='통화 종료'
          >
            <PhoneOff className='w-5 h-5' />
          </Button>
        </div>
      )}
    </div>
  );
};
