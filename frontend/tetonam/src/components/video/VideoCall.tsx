import { Button } from '@/components/ui/interactive/button';
import { RemoteUserStatusOverlay } from '@/components/video/RemoteUserStatusOverlay';
import { WaitingForConnection } from '@/components/video/WaitingForConnection';
import { CounselingDetailContent } from '@/components/counseling/CounselingDetailContent';
import { useAgoraClient } from '@/hooks/useAgoraClient';
import { agoraService } from '@/services/agoraService';
import { useAuthStore } from '@/stores/useAuthStore';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { Loader2, Mic, MicOff, PhoneOff, Video, VideoOff, X } from 'lucide-react';
import { useEffect, useRef, useState, useCallback } from 'react';

interface VideoCallProps {
  appointmentId: string;
  onEnd: () => void;
  isCounselor?: boolean; // 상담사 여부 (옵셔널로 설정)
}

export const VideoCall = ({ appointmentId, onEnd, isCounselor = false }: VideoCallProps) => {
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const uidRef = useRef<number | null>(null);

  const [showDetailPanel, setShowDetailPanel] = useState(isCounselor); // 상담사일 때 기본적으로 패널 표시

  const {
    isConnecting,
    isConnected,
    localVideoTrack,
    remoteUsers,
    error,
    waitingForUsers,
    networkQuality,
    isAudioEnabled,
    isVideoEnabled,
    join,
    leave,
    toggleAudio,
    toggleVideo,
  } = useAgoraClient();
  const { user } = useAuthStore();

  // 상대방 정보 상태 관리
  const remoteUser = Array.from(remoteUsers.values())[0];
  const hasRemoteUsers = remoteUsers.size > 0;

  // 패널 토글 핸들러 (useCallback으로 최적화)
  const handleToggleDetailPanel = useCallback(() => {
    setShowDetailPanel(prev => !prev);
  }, []);

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

        // 환경변수 접근 방식 통일 (dot notation 사용) - 강화된 체크
        const appId = import.meta.env.VITE_AGORA_APP_ID?.trim();

        if (!appId) {
          console.error(
            '❌ [VideoCall] VITE_AGORA_APP_ID 환경변수가 설정되지 않았습니다.'
          );
          console.error(
            '❌ [VideoCall] 환경변수 전체 목록:',
            Object.keys(import.meta.env)
          );
          throw new Error('Agora App ID가 설정되지 않았습니다. 관리자에게 문의하세요.');
        }

        if (appId.length < 32) {
          console.error(
            '❌ [VideoCall] 유효하지 않은 VITE_AGORA_APP_ID 형식입니다.'
          );
          throw new Error('Agora App ID 형식이 올바르지 않습니다. 관리자에게 문의하세요.');
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
      // 오류가 발생해도 화면을 나가도록 처리
      onEnd();
    }
  };

  // 오류 발생 시 자동으로 방 나가기 (useEffect 추가)
  useEffect(() => {
    if (error) {
      console.log('❌ [VideoCall] 오류 감지, 3초 후 자동으로 화면을 나갑니다:', error);

      // 3초 후 자동으로 화면 나가기
      const autoExitTimeout = setTimeout(() => {
        console.log('🚪 [VideoCall] 오류로 인한 자동 퇴장 실행');
        handleEndCall();
      }, 3000);

      return () => {
        clearTimeout(autoExitTimeout);
      };
    }

    // error가 없는 경우에도 cleanup 함수 반환
    return () => {};
  }, [error, leave, onEnd]);

  const handleToggleAudio = async () => {
    await toggleAudio();
  };

  const handleToggleVideo = async () => {
    await toggleVideo();
  };

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center h-screen bg-background select-none'>
        <div className='max-w-md text-center p-6 bg-card rounded-lg shadow-lg border'>
          <div className='text-destructive mb-4 text-lg font-semibold'>
            연결 오류가 발생했습니다
          </div>
          <p className='text-muted-foreground mb-4 text-sm'>
            {error}
          </p>
          <div className='mb-4 text-sm text-muted-foreground'>
            잠시 후 자동으로 화면이 전환됩니다...
          </div>
          <div className='flex gap-2 justify-center'>
            <Button onClick={handleEndCall} variant="outline">
              즉시 나가기
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="default"
            >
              다시 연결 시도
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 상담사용 레이아웃 (우측 패널 포함)
  if (isCounselor) {
    return (
      <div className='flex h-screen bg-black select-none'>
        {/* 비디오 콜 영역 (좌측) */}
        <div className={`relative transition-all duration-300 ${
          showDetailPanel ? 'w-3/4' : 'w-full'
        }`}>
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
                <span className='text-white text-sm font-medium select-none'>
                  상대방 음소거
                </span>
              </div>
            )}

            {/* 상담 패널 토글 버튼 (상담사용) */}
            <Button
              size='sm'
              variant='secondary'
              onClick={handleToggleDetailPanel}
              className='absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-black/70'
              aria-label={showDetailPanel ? '상담 상세 숨기기' : '상담 상세 보기'}
            >
              {showDetailPanel ? (
                <>
                  <X className='w-4 h-4 mr-1' />
                  숨기기
                </>
              ) : (
                '상담 상세'
              )}
            </Button>
          </div>

          {/* 로컬 비디오 (내 화면) - 우하단 */}
          <div className='absolute bottom-20 right-4 w-48 h-36 bg-gray-800 rounded-lg shadow-xl overflow-hidden border-2 border-white/20'>
            <div ref={localVideoRef} className='w-full h-full' />

            {/* 내 비디오가 꺼져있을 때 */}
            {!isVideoEnabled && (
              <div className='absolute inset-0 flex flex-col items-center justify-center bg-gray-800'>
                <VideoOff className='w-8 h-8 text-gray-400 mb-2' />
                <span className='text-gray-400 text-xs select-none'>내 카메라 꺼짐</span>
              </div>
            )}

            {/* 내 음소거 상태 표시 */}
            {!isAudioEnabled && (
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
              <span className='text-white text-sm font-medium select-none'>
                💬 상대방을 기다리는 중...
              </span>
            </div>
          )}

          {/* 연결 중 로딩 (기존 로직 유지) */}
          {isConnecting && (
            <div className='absolute inset-0 flex items-center justify-center bg-black/50'>
              <Loader2 className='w-8 h-8 text-white animate-spin' />
              <span className='ml-2 text-white select-none'>연결 중...</span>
            </div>
          )}

          {/* 컨트롤 버튼들 */}
          {isConnected && (
            <div className='absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 p-4 bg-black/70 rounded-full backdrop-blur-sm'>
              <Button
                size='icon'
                variant={isAudioEnabled ? 'secondary' : 'destructive'}
                onClick={handleToggleAudio}
                className='rounded-full w-12 h-12'
                aria-label={isAudioEnabled ? '마이크 끄기' : '마이크 켜기'}
              >
                {isAudioEnabled ? (
                  <Mic className='w-5 h-5' />
                ) : (
                  <MicOff className='w-5 h-5' />
                )}
              </Button>
              <Button
                size='icon'
                variant={isVideoEnabled ? 'secondary' : 'destructive'}
                onClick={handleToggleVideo}
                className='rounded-full w-12 h-12'
                aria-label={isVideoEnabled ? '카메라 끄기' : '카메라 켜기'}
              >
                {isVideoEnabled ? (
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

        {/* 상담 상세 패널 (우측) - 상담사용 */}
        {showDetailPanel && (
          <div className='w-1/4 border-l border-border/20 bg-background'>
            <CounselingDetailContent
              appointmentId={appointmentId}
              isCounselor={true}
              compact={true}
              className='h-full'
              inVideoCall={true}
            />
          </div>
        )}
      </div>
    );
  }

  // 기본 레이아웃 (학생용 - 전체 화면)
  return (
    <div className='relative h-screen bg-black select-none'>
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
            <span className='text-white text-sm font-medium select-none'>
              상대방 음소거
            </span>
          </div>
        )}
      </div>

      {/* 로컬 비디오 (내 화면) - 우상단 */}
      <div className='absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg shadow-xl overflow-hidden border-2 border-white/20'>
        <div ref={localVideoRef} className='w-full h-full' />

        {/* 내 비디오가 꺼져있을 때 */}
        {!isVideoEnabled && (
          <div className='absolute inset-0 flex flex-col items-center justify-center bg-gray-800'>
            <VideoOff className='w-8 h-8 text-gray-400 mb-2' />
            <span className='text-gray-400 text-xs select-none'>내 카메라 꺼짐</span>
          </div>
        )}

        {/* 내 음소거 상태 표시 */}
        {!isAudioEnabled && (
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
          <span className='text-white text-sm font-medium select-none'>
            💬 상대방을 기다리는 중...
          </span>
        </div>
      )}

      {/* 연결 중 로딩 (기존 로직 유지) */}
      {isConnecting && (
        <div className='absolute inset-0 flex items-center justify-center bg-black/50'>
          <Loader2 className='w-8 h-8 text-white animate-spin' />
          <span className='ml-2 text-white select-none'>연결 중...</span>
        </div>
      )}

      {/* 컨트롤 버튼들 */}
      {isConnected && (
        <div className='absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 p-4 bg-black/70 rounded-full backdrop-blur-sm'>
          <Button
            size='icon'
            variant={isAudioEnabled ? 'secondary' : 'destructive'}
            onClick={handleToggleAudio}
            className='rounded-full w-12 h-12'
            aria-label={isAudioEnabled ? '마이크 끄기' : '마이크 켜기'}
          >
            {isAudioEnabled ? (
              <Mic className='w-5 h-5' />
            ) : (
              <MicOff className='w-5 h-5' />
            )}
          </Button>
          <Button
            size='icon'
            variant={isVideoEnabled ? 'secondary' : 'destructive'}
            onClick={handleToggleVideo}
            className='rounded-full w-12 h-12'
            aria-label={isVideoEnabled ? '카메라 끄기' : '카메라 켜기'}
          >
            {isVideoEnabled ? (
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
