import { ROUTES } from '@/constants/routes';
import type {
  ApiResponse,
  JwtTokenResponse,
  TokenReissueData,
} from '@/types/api';
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

// 상수 정의
const API_CONSTANTS = {
  DEFAULT_TIMEOUT: 10000,
  ACCESS_TOKEN_KEY: 'accessToken',
  REFRESH_TOKEN_KEY: 'refreshToken',
  TOKEN_REISSUE_ENDPOINT: '/user/token/reissue',
} as const;

// 토큰 재발급 상태 관리
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// 토큰 재발급 함수
const refreshToken = async (): Promise<string | null> => {
  try {
    const accessToken = localStorage.getItem(API_CONSTANTS.ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(API_CONSTANTS.REFRESH_TOKEN_KEY);

    if (!accessToken || !refreshToken) {
      throw new Error('토큰이 없습니다.');
    }

    const response = await axios.post<ApiResponse<JwtTokenResponse>>(
      `${import.meta.env.VITE_API_URL}${API_CONSTANTS.TOKEN_REISSUE_ENDPOINT}`,
      {
        accessToken,
        refreshToken,
      } as TokenReissueData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.isSuccess && response.data.result) {
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        response.data.result;

      localStorage.setItem(API_CONSTANTS.ACCESS_TOKEN_KEY, newAccessToken);
      localStorage.setItem(API_CONSTANTS.REFRESH_TOKEN_KEY, newRefreshToken);

      return newAccessToken;
    } else {
      throw new Error(response.data.message || '토큰 재발급 실패');
    }
  } catch (error) {
    console.error('토큰 재발급 실패:', error);
    // 토큰 재발급 실패 시 로그아웃 처리
    localStorage.removeItem(API_CONSTANTS.ACCESS_TOKEN_KEY);
    localStorage.removeItem(API_CONSTANTS.REFRESH_TOKEN_KEY);
    window.location.href = ROUTES.LOGIN;
    return null;
  }
};

// API 클라이언트 기본 설정
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: API_CONSTANTS.DEFAULT_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 요청 인터셉터: 토큰 자동 추가
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem(API_CONSTANTS.ACCESS_TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );

  // 응답 인터셉터: 401 에러 처리 및 토큰 재발급
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as any;

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // 이미 토큰 재발급 중인 경우 대기
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return client(originalRequest);
            })
            .catch(err => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const newToken = await refreshToken();
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            processQueue(null, newToken);
            return client(originalRequest);
          } else {
            processQueue(new Error('토큰 재발급 실패'), null);
            return Promise.reject(error);
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
};

// AbortController를 지원하는 API 호출 래퍼 함수
export const createApiCall = <T>(
  apiCall: (signal?: AbortSignal) => Promise<T>
) => {
  return (signal?: AbortSignal) => apiCall(signal);
};

export const apiClient = createApiClient();
export default apiClient;
