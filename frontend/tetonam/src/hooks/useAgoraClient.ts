import type {
  AgoraConfig,
  RemoteUserState,
  VideoCallState,
} from '@/types/agora';
import AgoraRTC, {
  ConnectionDisconnectedReason,
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
    isAudioEnabled: true,
    isVideoEnabled: true,
  });

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const isLeavingRef = useRef(false);

  useEffect(() => {
    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

    // 사용자 채널 참여 이벤트
    client.on('user-joined', (user: IAgoraRTCRemoteUser) => {
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
          waitingForUsers: false,
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
            if (existingUser && user.videoTrack) {
              newUsers.set(user.uid.toString(), {
                ...existingUser,
                videoTrack: user.videoTrack,
                hasVideo: true,
              });
            } else if (user.videoTrack) {
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
            if (existingUser && user.audioTrack) {
              newUsers.set(user.uid.toString(), {
                ...existingUser,
                audioTrack: user.audioTrack,
                hasAudio: true,
              });
            } else if (user.audioTrack) {
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
      setState(prev => {
        const newUsers = new Map(prev.remoteUsers);
        newUsers.delete(user.uid.toString());
        return {
          ...prev,
          remoteUsers: newUsers,
          waitingForUsers: newUsers.size === 0,
        };
      });
    });

    // 네트워크 품질 모니터링
    client.on('network-quality', stats => {
      const downlinkQuality = stats.downlinkNetworkQuality;
      const uplinkQuality = stats.uplinkNetworkQuality;

      setState(prev => {
        const newState = {
          ...prev,
          networkQuality: downlinkQuality,
        };

        // 네트워크 품질이 불량할 때 사용자에게 알림
        if (downlinkQuality >= 4 || uplinkQuality >= 4) {
          newState.error =
            '네트워크 상태가 불안정합니다. 연결 품질이 저하될 수 있습니다.';
        } else if (prev.error?.includes('네트워크 상태가 불안정')) {
          // 네트워크가 다시 안정화되면 에러 메시지 제거
          newState.error = null;
        }

        return newState;
      });
    });

    // 연결 상태 변화 이벤트 리스너
    client.on('connection-state-change', (curState, _revState, reason) => {

      if (curState === 'CONNECTED') {
        setState(prev => ({
          ...prev,
          isConnected: true,
          waitingForUsers: true,
          error: null,
        }));
      } else if (curState === 'DISCONNECTED') {
        // reason에 따라 다른 메시지 표시
        let errorMessage = null;
        if (reason === ConnectionDisconnectedReason.NETWORK_ERROR) {
          errorMessage = '네트워크 오류로 연결이 끊어졌습니다.';
        } else if (reason === ConnectionDisconnectedReason.SERVER_ERROR) {
          errorMessage = '서버 오류로 연결이 끊어졌습니다.';
        }

        setState(prev => ({
          ...prev,
          isConnected: false,
          waitingForUsers: false,
          error: errorMessage,
        }));
      } else if (curState === 'CONNECTING') {
        setState(prev => ({
          ...prev,
          error: '연결 중입니다...',
        }));
      } else if (curState === 'DISCONNECTING') {
        setState(prev => ({
          ...prev,
          error: '연결을 종료하는 중입니다...',
        }));
      } else if (curState === 'RECONNECTING') {
        setState(prev => ({
          ...prev,
          error: '연결이 끊어져 재연결을 시도하고 있습니다...',
        }));
      } else if (curState === 'FAILED') {
        let errorMessage = '연결에 실패했습니다.';
        if (reason === ConnectionDisconnectedReason.UID_BANNED) {
          errorMessage = '서버에 의해 차단되었습니다.';
        } else if (reason === ConnectionDisconnectedReason.NETWORK_ERROR) {
          errorMessage =
            '네트워크 오류로 연결에 실패했습니다. 다시 시도해주세요.';
        } else if (reason === ConnectionDisconnectedReason.TOKEN_EXPIRE) {
          errorMessage = '인증 토큰이 만료되었습니다.';
        }

        setState(prev => ({
          ...prev,
          isConnected: false,
          waitingForUsers: false,
          error: errorMessage,
        }));
      }
    });

    // 예외 이벤트 리스너 (에러 코드별 세분화 처리)
    client.on('exception', event => {
      console.error('❌ [useAgoraClient] Agora 예외 발생:', event);

      let errorMessage = '연결 오류가 발생했습니다.';

      // event.msg에서 특정 에러 패턴 확인
      if (event.msg?.includes('SEND_AUDIO_BITRATE_TOO_LOW')) {
        errorMessage = '오디오 품질 설정 오류입니다. 연결을 다시 시도해주세요.';
      } else if (event.msg?.includes('NETWORK')) {
        errorMessage = '네트워크 연결이 불안정합니다.';
      } else if (event.msg?.includes('DEVICE')) {
        errorMessage = '카메라 또는 마이크에 문제가 있습니다.';
      } else if (event.msg) {
        errorMessage = `연결 오류: ${event.msg}`;
      }

      setState(prev => ({
        ...prev,
        error: errorMessage,
      }));
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

    // 중복 join 방지 (Agora 권장사항)
    if (state.isConnecting || state.isConnected) {
      console.warn(
        '⚠️ [useAgoraClient] 중복 join 시도 방지: 이미 연결 중이거나 연결된 상태입니다.'
      );
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    // Join with timeout to prevent infinite waiting
    const joinWithTimeout = async () => {
      try {
        // 브라우저 호환성 체크
        const isSupported = AgoraRTC.checkSystemRequirements();
        if (!isSupported) {
          throw new Error(
            '현재 브라우저는 화상 통화를 지원하지 않습니다. 최신 버전의 Chrome, Firefox, Safari를 사용해주세요.'
          );
        }

        // 고품질 설정으로 미디어 트랙 생성 (SEND_AUDIO_BITRATE_TOO_LOW 에러 해결)
        const [audioTrack, videoTrack] = await Promise.all([
          AgoraRTC.createMicrophoneAudioTrack({
            encoderConfig: 'high_quality_stereo',
          }),
          AgoraRTC.createCameraVideoTrack(),
        ]);

        try {
          // 채널 참여
          await clientRef.current!.join(
            config.appId,
            config.channel,
            config.token ?? null,
            config.uid ?? null
          );

          // 미디어 스트림 발행
          await clientRef.current!.publish([audioTrack, videoTrack]);

          setState(prev => ({
            ...prev,
            isConnecting: false,
            isConnected: true,
            localAudioTrack: audioTrack,
            localVideoTrack: videoTrack,
            waitingForUsers: true,
            isAudioEnabled: true,
            isVideoEnabled: true,
          }));

        } catch (joinError) {
          // Join 실패 시 생성된 tracks 즉시 정리 (리소스 waste 방지)
          try {
            audioTrack?.close();
            videoTrack?.close();
          } catch (cleanupError) {
            console.warn(
              '⚠️ [useAgoraClient] Tracks 정리 중 오류:',
              cleanupError
            );
          }
          throw joinError;
        }
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
        } else if (err.code === 'SEND_AUDIO_BITRATE_TOO_LOW') {
          errorMessage =
            '오디오 품질 설정 오류입니다. 잠시 후 다시 시도해주세요.';
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
    };

    // 30초 timeout으로 join 시도
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () =>
          reject(new Error('연결 시간이 초과되었습니다. 다시 시도해주세요.')),
        30000
      )
    );

    try {
      await Promise.race([joinWithTimeout(), timeoutPromise]);
    } catch (error: any) {
      console.error('❌ [useAgoraClient] join timeout 또는 에러:', error);
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message || '연결에 실패했습니다.',
      }));
      throw error;
    }
  }, []);

  const leave = useCallback(async () => {
    if (!clientRef.current || isLeavingRef.current) {
      return;
    }

    isLeavingRef.current = true;

    try {
      // 현재 상태 가져오기
      const currentState = state;

      // 1. 채널에 연결된 상태에서만 unpublish 수행 (Agora 공식 권장사항)
      if (
        currentState.isConnected &&
        (currentState.localAudioTrack || currentState.localVideoTrack)
      ) {
        const tracksToUnpublish = [
          currentState.localAudioTrack,
          currentState.localVideoTrack,
        ].filter((track): track is NonNullable<typeof track> => track !== null);

        if (tracksToUnpublish.length > 0) {
          try {
            await clientRef.current.unpublish(tracksToUnpublish);
          } catch (unpublishError) {
            // unpublish 실패는 로그만 남기고 계속 진행 (채널 나가기는 수행)
            console.warn(
              '⚠️ [useAgoraClient] unpublish 실패, 계속 진행:',
              unpublishError
            );
          }
        }
      }

      // 2. 채널 떠나기
      await clientRef.current.leave();

      // 3. 트랙 정리
      if (currentState.localAudioTrack) {
        currentState.localAudioTrack.close();
      }

      if (currentState.localVideoTrack) {
        currentState.localVideoTrack.close();
      }

      // 4. 상태 초기화
      setState({
        isConnecting: false,
        isConnected: false,
        localAudioTrack: null,
        localVideoTrack: null,
        remoteUsers: new Map<string, IAgoraRTCRemoteUser & RemoteUserState>(),
        error: null,
        waitingForUsers: false,
        isAudioEnabled: true,
        isVideoEnabled: true,
      });

    } catch (error) {
      console.error('❌ [useAgoraClient] 연결 해제 중 오류:', error);
    } finally {
      isLeavingRef.current = false;
    }
  }, [state.isConnected, state.localAudioTrack, state.localVideoTrack]);

  const toggleAudio = useCallback(async () => {
    if (state.localAudioTrack) {
      const newEnabled = !state.isAudioEnabled;
      await state.localAudioTrack.setEnabled(newEnabled);
      setState(prev => ({
        ...prev,
        isAudioEnabled: newEnabled,
      }));
    }
  }, [state.localAudioTrack, state.isAudioEnabled]);

  const toggleVideo = useCallback(async () => {
    if (state.localVideoTrack) {
      const newEnabled = !state.isVideoEnabled;
      await state.localVideoTrack.setEnabled(newEnabled);
      setState(prev => ({
        ...prev,
        isVideoEnabled: newEnabled,
      }));
    }
  }, [state.localVideoTrack, state.isVideoEnabled]);

  return {
    ...state,
    join,
    leave,
    toggleAudio,
    toggleVideo,
  };
};
