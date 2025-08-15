import type {
  AgoraConfig,
  RemoteUserState,
  VideoCallState,
} from '@/types/agora';
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
    remoteUsers: new Map<string, IAgoraRTCRemoteUser & RemoteUserState>(),
    error: null,
    waitingForUsers: false,
  });

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const isLeavingRef = useRef(false);

  useEffect(() => {
    // Agora 공식 권장사항: 1:1 화상통화는 rtc 모드 사용
    const client = AgoraRTC.createClient({ 
      mode: 'rtc', // live 대신 rtc 모드 (1:1 통신에 적합)
      codec: 'vp8' // 기본 코덱 사용
    });

    // 사용자 채널 참여 이벤트 (Agora Best Practice)
    client.on('user-joined', (user: IAgoraRTCRemoteUser) => {
      console.log(
        '✅ [useAgoraClient] 사용자가 채널에 참여했습니다:',
        user.uid
      );
      setState(prev => {
        const newUsers = new Map(prev.remoteUsers);
        const remoteUserWithState: IAgoraRTCRemoteUser & RemoteUserState = {
          ...user,
          uid: user.uid,
          hasAudio: false,
          hasVideo: false,
          userName: `사용자 ${user.uid}`,
          joinedAt: new Date(),
          connectionQuality: 0,
        };
        newUsers.set(user.uid.toString(), remoteUserWithState);
        return {
          ...prev,
          remoteUsers: newUsers,
          waitingForUsers: false, // 사용자가 참여했으므로 대기 상태 해제
        };
      });
    });

    client.on('user-published', async (user, mediaType) => {
      try {
        await client.subscribe(user, mediaType);

        if (mediaType === 'video') {
          setState(prev => {
            const newUsers = new Map(prev.remoteUsers);
            const existingUser = newUsers.get(user.uid.toString());
            if (existingUser) {
              newUsers.set(user.uid.toString(), {
                ...existingUser,
                ...user,
                hasVideo: true,
              });
            } else {
              // user-joined 이벤트 없이 바로 published된 경우 대비
              const remoteUserWithState: IAgoraRTCRemoteUser & RemoteUserState =
                {
                  ...user,
                  uid: user.uid,
                  hasAudio: false,
                  hasVideo: true,
                  userName: `사용자 ${user.uid}`,
                  joinedAt: new Date(),
                  connectionQuality: 0,
                };
              newUsers.set(user.uid.toString(), remoteUserWithState);
            }
            return {
              ...prev,
              remoteUsers: newUsers,
              waitingForUsers: false,
            };
          });
        }

        if (mediaType === 'audio' && user.audioTrack) {
          user.audioTrack.play();
          setState(prev => {
            const newUsers = new Map(prev.remoteUsers);
            const existingUser = newUsers.get(user.uid.toString());
            if (existingUser) {
              newUsers.set(user.uid.toString(), {
                ...existingUser,
                ...user,
                hasAudio: true,
              });
            } else {
              // user-joined 이벤트 없이 바로 published된 경우 대비
              const remoteUserWithState: IAgoraRTCRemoteUser & RemoteUserState =
                {
                  ...user,
                  uid: user.uid,
                  hasAudio: true,
                  hasVideo: false,
                  userName: `사용자 ${user.uid}`,
                  joinedAt: new Date(),
                  connectionQuality: 0,
                };
              newUsers.set(user.uid.toString(), remoteUserWithState);
            }
            return {
              ...prev,
              remoteUsers: newUsers,
              waitingForUsers: false,
            };
          });
        }
      } catch (error) {
        console.error('❌ [useAgoraClient] 사용자 구독 실패:', error);
      }
    });

    client.on('user-unpublished', (user, mediaType) => {
      console.log(
        `📤 [useAgoraClient] 사용자 ${user.uid}가 ${mediaType} 발행을 중단했습니다`
      );

      setState(prev => {
        const newUsers = new Map(prev.remoteUsers);
        const existingUser = newUsers.get(user.uid.toString());

        if (existingUser) {
          if (mediaType === 'video') {
            newUsers.set(user.uid.toString(), {
              ...existingUser,
              hasVideo: false,
            });
          } else if (mediaType === 'audio') {
            newUsers.set(user.uid.toString(), {
              ...existingUser,
              hasAudio: false,
            });
          }
        }

        return { ...prev, remoteUsers: newUsers };
      });
    });

    client.on('user-left', (user: IAgoraRTCRemoteUser) => {
      console.log('👋 [useAgoraClient] 사용자가 채널을 떠났습니다:', user.uid);
      setState(prev => {
        const newUsers = new Map(prev.remoteUsers);
        newUsers.delete(user.uid.toString());
        return {
          ...prev,
          remoteUsers: newUsers,
          waitingForUsers: newUsers.size === 0, // 모든 사용자가 떠나면 대기 상태로 전환
        };
      });
    });

    // 네트워크 품질 모니터링 및 자동 화질 조정 (Agora Best Practice)
    client.on('network-quality', stats => {
      const downlinkQuality = stats.downlinkNetworkQuality;

      setState(prev => {
        // 네트워크 상태에 따른 자동 화질 조정 (Stale Closure 방지)
        if (prev.localVideoTrack && downlinkQuality) {
          if (downlinkQuality <= 2) {
            // 네트워크 상태가 나쁘면 화질 낮춤 (더 보수적인 설정)
            prev.localVideoTrack.setEncoderConfiguration({
              width: 480,
              height: 360,
              frameRate: 15,
              bitrateMax: 500,
              bitrateMin: 200,
            });
            console.log(
              '🔽 [useAgoraClient] 네트워크 상태 불량으로 화질을 낮췄습니다'
            );
          } else if (downlinkQuality >= 4) {
            // 네트워크 상태가 좋으면 중간 화질 사용 (고화질 대신 안정성 우선)
            prev.localVideoTrack.setEncoderConfiguration({
              width: 960,
              height: 540,
              frameRate: 24,
              bitrateMax: 1500,
              bitrateMin: 600,
            });
            console.log(
              '🔼 [useAgoraClient] 네트워크 상태 양호로 중간 화질을 사용합니다'
            );
          } else {
            // 기본 화질 사용 (더 안정적인 설정)
            prev.localVideoTrack.setEncoderConfiguration({
              width: 640,
              height: 480,
              frameRate: 20,
              bitrateMax: 1000,
              bitrateMin: 400,
            });
            console.log(
              '🔄 [useAgoraClient] 네트워크 상태에 따라 기본 화질을 사용합니다'
            );
          }
        }

        return {
          ...prev,
          networkQuality: downlinkQuality,
        };
      });
    });

    // 연결 상태 변화 이벤트 리스너 추가 (Agora Best Practice) - 강화된 연결 관리
    client.on('connection-state-change', async (curState, revState) => {
      console.log(
        `🔄 [useAgoraClient] 연결 상태 변화: ${revState} -> ${curState}`
      );

      if (curState === 'CONNECTED') {
        setState(prev => ({
          ...prev,
          isConnected: true,
          waitingForUsers: true,
          error: null, // 연결 성공 시 이전 오류 초기화
        }));
      } else if (curState === 'DISCONNECTED') {
        setState(prev => ({
          ...prev,
          isConnected: false,
          waitingForUsers: false,
        }));
      } else if (curState === 'RECONNECTING') {
        console.log('🔄 [useAgoraClient] 연결 재시도 중...');
        setState(prev => ({
          ...prev,
          error: '연결이 불안정합니다. 재연결을 시도하고 있습니다...',
        }));
      }
    });

    // 예외 이벤트 리스너 추가 (Agora Best Practice) - 강화된 오류 처리
    client.on('exception', async event => {
      console.error('❌ [useAgoraClient] Agora 예외 발생:', event);

      // 심각한 오류들 - 자동으로 방을 나가야 하는 경우들 (추가 오류 유형 포함)
      const criticalErrors = [
        'SEND_AUDIO_BITRATE_TOO_LOW',
        'NETWORK_UNAVAILABLE',
        'WEBSOCKET_DISCONNECTED',
        'ICE_CONNECTION_FAILED',
        'CONNECTION_TIMEOUT',
        'WEBRTC_CONNECTION_FAILED', // WebRTC 연결 실패
        'TOKEN_EXPIRED', // 토큰 만료
        'INVALID_PARAMETER', // 잘못된 파라미터
        'NETWORK_ERROR', // 네트워크 오류
        'SERVER_ERROR', // 서버 오류
      ];

      const isCriticalError = criticalErrors.some(
        error =>
          event.msg?.includes(error) || event.code?.toString().includes(error)
      );

      if (isCriticalError) {
        console.error(
          '💥 [useAgoraClient] 심각한 연결 오류 감지, 자동으로 방을 나갑니다:',
          event.msg
        );

        // 자동으로 방 나가기 (비동기 처리로 blocking 방지)
        setTimeout(async () => {
          try {
            if (clientRef.current && !isLeavingRef.current) {
              console.log('🚪 [useAgoraClient] 오류로 인한 자동 퇴장 시작...');
              await leave();
            }
          } catch (leaveError) {
            console.error('❌ [useAgoraClient] 자동 퇴장 중 오류:', leaveError);
          }
        }, 1000); // 1초 후 자동 퇴장
      }

      setState(prev => ({
        ...prev,
        error: `연결 오류: ${event.msg || event.code || '알 수 없는 오류'}`,
      }));
    });

    clientRef.current = client;

    return () => {
      client.removeAllListeners();
    };
  }, []);

  const join = useCallback(async (config: AgoraConfig) => {
    console.log('🚀 [useAgoraClient] join 함수 시작:', config);
    
    if (!clientRef.current || isLeavingRef.current) {
      console.error(
        '❌ [useAgoraClient] join 실패: 클라이언트가 없거나 종료 중'
      );
      return;
    }

    console.log('🔄 [useAgoraClient] 연결 시작 - isConnecting: true로 설정');
    setState(prev => ({ ...prev, isConnecting: true, error: null }));
    
    try {
      console.log('🔍 [useAgoraClient] 브라우저 호환성 확인 중...');
      // Agora Best Practice: 브라우저 호환성 체크
      const isSupported = AgoraRTC.checkSystemRequirements();
      if (!isSupported) {
        throw new Error(
          '현재 브라우저는 화상 통화를 지원하지 않습니다. 최신 버전의 Chrome, Firefox, Safari를 사용해주세요.'
        );
      }

      // Agora 공식 권장사항: 간단한 기본 설정으로 시작
      const [audioTrack, videoTrack] = await Promise.all([
        AgoraRTC.createMicrophoneAudioTrack(),
        AgoraRTC.createCameraVideoTrack(),
      ]);
      console.log('✅ [useAgoraClient] 기본 미디어 트랙 생성 성공');

      // RTC 모드에서는 setClientRole 호출 불필요
      // 채널 참여
      await clientRef.current.join(
        config.appId,
        config.channel,
        config.token ?? null,
        config.uid ?? null
      );
      console.log('✅ [useAgoraClient] 채널 참여 성공');

      // 미디어 스트림 발행
      await clientRef.current.publish([audioTrack, videoTrack]);
      console.log('✅ [useAgoraClient] 미디어 스트림 발행 성공');

      setState(prev => ({
        ...prev,
        isConnecting: false,
        isConnected: true,
        localAudioTrack: audioTrack,
        localVideoTrack: videoTrack,
        waitingForUsers: true, // 연결 후 상대방을 기다리는 상태
      }));

      console.log('✅ [useAgoraClient] 화상 통화 연결 성공');
    } catch (err: any) {
      console.error('❌ [useAgoraClient] join 실패:', err);

      // 에러 타입에 따른 사용자 친화적 메시지
      let errorMessage = '연결 실패';
      if (err.code === 'PERMISSION_DENIED') {
        errorMessage =
          '카메라 또는 마이크 권한이 필요합니다. 브라우저 설정에서 권한을 허용해주세요.';
      } else if (err.code === 'DEVICE_NOT_FOUND') {
        errorMessage =
          '카메라 또는 마이크를 찾을 수 없습니다. 장치가 연결되어 있는지 확인해주세요.';
      } else if (err.code === 'NETWORK_ERROR') {
        errorMessage = '네트워크 연결을 확인해주세요.';
      } else {
        errorMessage = err?.message ?? '알 수 없는 오류가 발생했습니다.';
      }

      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: errorMessage,
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
      console.log('🔌 [useAgoraClient] 화상 통화 연결 해제 시작...');

      // 현재 상태 참조 (closure 문제 방지)
      const currentState = state;

      // Agora Best Practice: 리소스 정리 순서
      // 1. 먼저 unpublish 수행
      if (currentState.localAudioTrack || currentState.localVideoTrack) {
        const tracksToUnpublish = [
          currentState.localAudioTrack,
          currentState.localVideoTrack,
        ].filter((track): track is NonNullable<typeof track> => track !== null);

        if (tracksToUnpublish.length > 0) {
          await clientRef.current.unpublish(tracksToUnpublish);
          console.log('📤 [useAgoraClient] 로컬 미디어 스트림 발행 중단');
        }
      }

      // 2. 트랙 정리
      if (currentState.localAudioTrack) {
        currentState.localAudioTrack.close();
        console.log('🎤 [useAgoraClient] 오디오 트랙 정리 완료');
      }

      if (currentState.localVideoTrack) {
        currentState.localVideoTrack.close();
        console.log('📹 [useAgoraClient] 비디오 트랙 정리 완료');
      }

      // 3. 채널 떠나기
      await clientRef.current.leave();
      console.log('👋 [useAgoraClient] 채널 나가기 완료');

      // 4. 상태 초기화
      setState({
        isConnecting: false,
        isConnected: false,
        localAudioTrack: null,
        localVideoTrack: null,
        remoteUsers: new Map<string, IAgoraRTCRemoteUser & RemoteUserState>(),
        error: null,
        waitingForUsers: false,
      });

      console.log('✅ [useAgoraClient] 화상 통화 연결 해제 완료');
    } catch (error) {
      console.error('❌ [useAgoraClient] 연결 해제 중 오류:', error);
    } finally {
      isLeavingRef.current = false;
    }
  }, []); // dependency 제거 - state를 직접 참조

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
