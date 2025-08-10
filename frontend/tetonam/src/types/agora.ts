import type {
  IAgoraRTCRemoteUser,
  ILocalAudioTrack,
  ILocalVideoTrack,
} from 'agora-rtc-sdk-ng';

export interface AgoraConfig {
  appId: string;
  channel: string;
  token: string | null;
  uid: string | number | null;
}

export interface VideoCallState {
  isConnecting: boolean;
  isConnected: boolean;
  localAudioTrack: ILocalAudioTrack | null;
  localVideoTrack: ILocalVideoTrack | null;
  remoteUsers: Map<string, IAgoraRTCRemoteUser>;
  error: string | null;
}

export interface TokenResponse {
  token: string;
  channel: string;
  uid: string | number;
  expiresIn: number;
}

export interface VideoCallSessionParticipant {
  userId: string;
  role: 'COUNSELOR' | 'USER';
  joinedAt?: Date;
  leftAt?: Date;
}

export interface VideoCallSession {
  appointmentId: string;
  channelName: string;
  startTime: Date;
  endTime?: Date;
  participants: VideoCallSessionParticipant[];
}

export interface AgoraRtcErrorLike {
  code?: string;
  message?: string;
}
