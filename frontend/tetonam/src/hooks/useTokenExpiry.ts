import { AUTH_CONSTANTS } from '@/constants/auth';
import { useAuthStore } from '@/stores/useAuthStore';
import { useEffect, useRef } from 'react';

interface TokenPayload {
  exp: number;
  sub: string;
  [key: string]: any;
}

const decodeToken = (token: string): TokenPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

const getTokenExpiryTime = (): number | null => {
  const token = localStorage.getItem(AUTH_CONSTANTS.STORAGE_KEYS.ACCESS_TOKEN);
  if (!token) return null;

  const payload = decodeToken(token);
  return payload?.exp ? payload.exp * 1000 : null; // 밀리초로 변환
};

const isTokenExpired = (): boolean => {
  const expiryTime = getTokenExpiryTime();
  if (!expiryTime) return true;

  // 현재 시간보다 30초 이전에 만료되면 만료된 것으로 간주
  return Date.now() >= expiryTime - 30000;
};

export const useTokenExpiry = () => {
  const { logout } = useAuthStore();
  // 브라우저/Node 환경 모두 호환되도록 반환 타입 추론 사용
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const checkTokenExpiry = () => {
      if (isTokenExpired()) {
        logout();
        // 로그인 페이지로 리다이렉트
        window.location.href = '/login';
      }
    };

    // 초기 체크
    checkTokenExpiry();

    // 1분마다 토큰 만료 체크
    checkIntervalRef.current = setInterval(checkTokenExpiry, 60000);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [logout]);

  return {
    isTokenExpired,
  };
};
