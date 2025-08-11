import type { AgoraConfig, VideoCallState } from '@/types/agora';
import AgoraRTC, {
  IAgoraRTCClient,
  IAgoraRTCRemoteUser,
} from 'agora-rtc-sdk-ng';
import { useCallback, useEffect, useRef, useState } from 'react';

export const useAgoraClient = () => {
  const [state, setState] = useState<VideoCallState>({
    isConnecting: false,
    isConnected: false,
    localAudioTrack: null,
    localVideoTrack: null,
    remoteUsers: new Map<string, IAgoraRTCRemoteUser>(),
    error: null,
  });

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const isLeavingRef = useRef(false);

  useEffect(() => {
    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

    client.on('user-published', async (user, mediaType) => {
      try {
        await client.subscribe(user, mediaType);

        if (mediaType === 'video') {
          setState(prev => ({
            ...prev,
            remoteUsers: new Map(prev.remoteUsers).set(
              user.uid.toString(),
              user
            ),
          }));
        }

        if (mediaType === 'audio' && user.audioTrack) {
          user.audioTrack.play();
        }
      } catch (error) {
        console.error('❌ [useAgoraClient] 사용자 구독 실패:', error);
      }
    });

    client.on('user-unpublished', (user, mediaType) => {
      if (mediaType === 'video') {
        setState(prev => {
          const newUsers = new Map(prev.remoteUsers);
          newUsers.delete(user.uid.toString());
          return { ...prev, remoteUsers: newUsers };
        });
      }
    });

    client.on('user-left', (user: IAgoraRTCRemoteUser) => {
      setState(prev => {
        const newUsers = new Map(prev.remoteUsers);
        newUsers.delete(user.uid.toString());
        return { ...prev, remoteUsers: newUsers };
      });
    });

    // 연결 상태 변화 이벤트 리스너 추가
    client.on('connection-state-change', (_curState, _revState) => {
      // 필요시 상태 변화 로깅을 위한 부분 (개발 환경에서만 활성화)
    });

    // 예외 이벤트 리스너 추가
    client.on('exception', event => {
      console.error('❌ [useAgoraClient] Agora 예외 발생:', event);
    });

    clientRef.current = client;

    return () => {
      client.removeAllListeners();
    };
  }, []);

  const join = useCallback(async (config: AgoraConfig) => {
    if (!clientRef.current || isLeavingRef.current) {
      console.error(
        '❌ [useAgoraClient] join 실패: 클라이언트가 없거나 종료 중'
      );
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));
    try {
      const [audioTrack, videoTrack] = await Promise.all([
        AgoraRTC.createMicrophoneAudioTrack(),
        AgoraRTC.createCameraVideoTrack(),
      ]);

      await clientRef.current.join(
        config.appId,
        config.channel,
        config.token ?? null,
        config.uid ?? null
      );

      await clientRef.current.publish([audioTrack, videoTrack]);

      setState(prev => ({
        ...prev,
        isConnecting: false,
        isConnected: true,
        localAudioTrack: audioTrack,
        localVideoTrack: videoTrack,
      }));
    } catch (err: any) {
      console.error('❌ [useAgoraClient] join 실패:', err);
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: err?.message ?? '연결 실패',
      }));
      throw err;
    }
  }, []);

  const leave = useCallback(async () => {
    if (!clientRef.current || isLeavingRef.current) {
      return;
    }

    isLeavingRef.current = true;

    try {
      state.localAudioTrack?.close();
      state.localVideoTrack?.close();

      await clientRef.current.leave();

      setState({
        isConnecting: false,
        isConnected: false,
        localAudioTrack: null,
        localVideoTrack: null,
        remoteUsers: new Map<string, IAgoraRTCRemoteUser>(),
        error: null,
      });
    } finally {
      isLeavingRef.current = false;
    }
  }, [state.localAudioTrack, state.localVideoTrack]);

  const toggleAudio = useCallback(
    async (enabled: boolean) => {
      if (state.localAudioTrack) {
        await state.localAudioTrack.setEnabled(enabled);
      }
    },
    [state.localAudioTrack]
  );

  const toggleVideo = useCallback(
    async (enabled: boolean) => {
      if (state.localVideoTrack) {
        await state.localVideoTrack.setEnabled(enabled);
      }
    },
    [state.localVideoTrack]
  );

  return {
    ...state,
    join,
    leave,
    toggleAudio,
    toggleVideo,
  };
};
