import { apiClient } from '@/services/apiClient';
import type { TokenResponse } from '@/types/agora';
import type { ApiResponse } from '@/types/api';

interface BackendTokenDto {
  token: string;
  counselingId: string;
  userId: number;
}

export const agoraService = {
  // 백엔드 토큰 발급 API 연동: GET /api/token/c-id/{counseling_id}/u-id/{user_id}/
  async getToken(counselingId: string, userId: number): Promise<TokenResponse> {
    const response = await apiClient.get<ApiResponse<BackendTokenDto>>(
      `/api/token/c-id/${encodeURIComponent(counselingId)}/u-id/${userId}/`
    );

    if (!response.data.isSuccess || !response.data.result) {
      throw new Error(response.data.message || '토큰 발급 실패');
    }

    const {
      token,
      counselingId: rawChannel,
      userId: uidNum,
    } = response.data.result;
    const channel =
      typeof rawChannel === 'string' ? rawChannel.trim() : rawChannel;
    const mapped: TokenResponse = {
      token,
      channel,
      uid: uidNum,
      expiresIn: 3600, // 서버에서 미제공: 사용처에서 필요 없음
    };
    return mapped;
  },
};
