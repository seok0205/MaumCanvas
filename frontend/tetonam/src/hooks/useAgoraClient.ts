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
    console.log('🔍 [useAgoraClient] Agora 클라이언트 생성 시작');
    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    console.log('🔍 [useAgoraClient] 클라이언트 생성 완료:', client);

    client.on('user-published', async (user, mediaType) => {
      console.log('🔍 [useAgoraClient] user-published 이벤트:', {
        user: user.uid,
        mediaType,
      });
      try {
        await client.subscribe(user, mediaType);
        console.log('✅ [useAgoraClient] 사용자 구독 성공:', {
          user: user.uid,
          mediaType,
        });

        if (mediaType === 'video') {
          setState(prev => ({
            ...prev,
            remoteUsers: new Map(prev.remoteUsers).set(
              user.uid.toString(),
              user
            ),
          }));
          console.log(
            '🔍 [useAgoraClient] 원격 사용자 비디오 추가됨:',
            user.uid
          );
        }

        if (mediaType === 'audio' && user.audioTrack) {
          user.audioTrack.play();
          console.log(
            '🔍 [useAgoraClient] 원격 사용자 오디오 재생 시작:',
            user.uid
          );
        }
      } catch (error) {
        console.error('❌ [useAgoraClient] 사용자 구독 실패:', error);
      }
    });

    client.on('user-unpublished', (user, mediaType) => {
      console.log('🔍 [useAgoraClient] user-unpublished 이벤트:', {
        user: user.uid,
        mediaType,
      });
      if (mediaType === 'video') {
        setState(prev => {
          const newUsers = new Map(prev.remoteUsers);
          newUsers.delete(user.uid.toString());
          console.log(
            '🔍 [useAgoraClient] 원격 사용자 비디오 제거됨:',
            user.uid
          );
          return { ...prev, remoteUsers: newUsers };
        });
      }
    });

    client.on('user-left', (user: IAgoraRTCRemoteUser) => {
      console.log('🔍 [useAgoraClient] user-left 이벤트:', user.uid);
      setState(prev => {
        const newUsers = new Map(prev.remoteUsers);
        newUsers.delete(user.uid.toString());
        console.log('🔍 [useAgoraClient] 사용자 완전히 떠남:', user.uid);
        return { ...prev, remoteUsers: newUsers };
      });
    });

    // 연결 상태 변화 이벤트 리스너 추가
    client.on('connection-state-change', (curState, revState) => {
      console.log('🔍 [useAgoraClient] 연결 상태 변화:', {
        from: revState,
        to: curState,
      });
    });

    // 예외 이벤트 리스너 추가
    client.on('exception', event => {
      console.error('❌ [useAgoraClient] Agora 예외 발생:', event);
    });

    clientRef.current = client;
    console.log('✅ [useAgoraClient] 클라이언트 설정 완료');

    return () => {
      console.log('🔍 [useAgoraClient] 클라이언트 정리 시작');
      client.removeAllListeners();
      console.log('✅ [useAgoraClient] 클라이언트 정리 완료');
    };
  }, []);

  const join = useCallback(async (config: AgoraConfig) => {
    if (!clientRef.current || isLeavingRef.current) {
      console.error(
        '❌ [useAgoraClient] join 실패: 클라이언트가 없거나 종료 중'
      );
      return;
    }

    console.log('🔍 [useAgoraClient] join 시작:', {
      appId: config.appId.substring(0, 8) + '...',
      channel: config.channel,
      uid: config.uid,
    });

    setState(prev => ({ ...prev, isConnecting: true, error: null }));
    try {
      console.log('🔍 [useAgoraClient] 미디어 트랙 생성 시작');
      const [audioTrack, videoTrack] = await Promise.all([
        AgoraRTC.createMicrophoneAudioTrack(),
        AgoraRTC.createCameraVideoTrack(),
      ]);
      console.log('✅ [useAgoraClient] 미디어 트랙 생성 완료');

      console.log('🔍 [useAgoraClient] 채널 조인 시작');
      await clientRef.current.join(
        config.appId,
        config.channel,
        config.token ?? null,
        config.uid ?? null
      );
      console.log('✅ [useAgoraClient] 채널 조인 완료');

      console.log('🔍 [useAgoraClient] 미디어 퍼블리시 시작');
      await clientRef.current.publish([audioTrack, videoTrack]);
      console.log('✅ [useAgoraClient] 미디어 퍼블리시 완료');

      setState(prev => ({
        ...prev,
        isConnecting: false,
        isConnected: true,
        localAudioTrack: audioTrack,
        localVideoTrack: videoTrack,
      }));
      console.log('✅ [useAgoraClient] join 전체 과정 완료');
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
      console.log(
        '🔍 [useAgoraClient] leave 건너뜀: 클라이언트가 없거나 이미 종료 중'
      );
      return;
    }

    isLeavingRef.current = true;
    console.log('🔍 [useAgoraClient] leave 시작');

    try {
      console.log('🔍 [useAgoraClient] 로컬 트랙 정리 시작');
      state.localAudioTrack?.close();
      state.localVideoTrack?.close();
      console.log('✅ [useAgoraClient] 로컬 트랙 정리 완료');

      console.log('🔍 [useAgoraClient] 채널 떠나기 시작');
      await clientRef.current.leave();
      console.log('✅ [useAgoraClient] 채널 떠나기 완료');

      setState({
        isConnecting: false,
        isConnected: false,
        localAudioTrack: null,
        localVideoTrack: null,
        remoteUsers: new Map<string, IAgoraRTCRemoteUser>(),
        error: null,
      });
      console.log('✅ [useAgoraClient] leave 전체 과정 완료');
    } finally {
      isLeavingRef.current = false;
    }
  }, [state.localAudioTrack, state.localVideoTrack]);

  const toggleAudio = useCallback(
    async (enabled: boolean) => {
      console.log('🔍 [useAgoraClient] toggleAudio:', enabled);
      if (state.localAudioTrack) {
        await state.localAudioTrack.setEnabled(enabled);
        console.log('✅ [useAgoraClient] 오디오 상태 변경 완료:', enabled);
      }
    },
    [state.localAudioTrack]
  );

  const toggleVideo = useCallback(
    async (enabled: boolean) => {
      console.log('🔍 [useAgoraClient] toggleVideo:', enabled);
      if (state.localVideoTrack) {
        await state.localVideoTrack.setEnabled(enabled);
        console.log('✅ [useAgoraClient] 비디오 상태 변경 완료:', enabled);
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
