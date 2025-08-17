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

export interface RemoteUserState {
  uid: string | number;
  hasAudio: boolean;
  hasVideo: boolean;
  userName?: string;
  joinedAt?: Date;
  connectionQuality?: number;
}

export interface VideoCallState {
  isConnecting: boolean;
  isConnected: boolean;
  localAudioTrack: ILocalAudioTrack | null;
  localVideoTrack: ILocalVideoTrack | null;
  remoteUsers: Map<string, IAgoraRTCRemoteUser & RemoteUserState>;
  error: string | null;
  networkQuality?: number;
  waitingForUsers: boolean;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
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
