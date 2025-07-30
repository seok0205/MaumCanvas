import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

// 상수 정의
const API_CONSTANTS = {
  DEFAULT_BASE_URL: '/api',
  DEFAULT_TIMEOUT: 10000,
  LOGIN_PATH: '/login',
  TOKEN_KEY: 'accessToken',
} as const;

// API 클라이언트 기본 설정
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || API_CONSTANTS.DEFAULT_BASE_URL,
    timeout: API_CONSTANTS.DEFAULT_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 요청 인터셉터: 토큰 자동 추가
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem(API_CONSTANTS.TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );

  // 응답 인터셉터: 401 에러 처리
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    error => {
      if (error.response?.status === 401) {
        // 토큰 만료 시 로그아웃 처리
        localStorage.removeItem(API_CONSTANTS.TOKEN_KEY);
        window.location.href = API_CONSTANTS.LOGIN_PATH;
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
