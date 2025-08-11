// 백엔드 API 응답 타입 정의
// 실제 백엔드에서 반환되는 데이터 구조를 정확히 타입화

import { convertLocalDateTimeArrayToISO } from '@/types/api';
import type { CommunityCategory } from './community';

// 백엔드 Page<T> 응답 구조
export interface PageResponse<T> {
  content: T[];
  pageable: {
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    pageSize: number;
    pageNumber: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

// 백엔드 PostPageDto 타입
export interface PostPageDto {
  id: number;
  title: string;
  nickname: string;
  category: CommunityCategory;
  createdDate: number[] | string; // LocalDateTime 배열 또는 이미 변환된 문자열
}

// 백엔드 PostListDto 타입
export interface PostListDto {
  id: number;
  title: string;
  content: string;
  category: CommunityCategory;
  nickname: string;
  viewCount: number;
  commentCount: number;
  createdDate: number[] | string; // LocalDateTime 배열 또는 이미 변환된 문자열
}

// 백엔드 CommentListDto 타입
export interface CommentListDto {
  id: number;
  content: string;
  nickname: string;
  createdDate: number[] | string; // LocalDateTime 배열 또는 이미 변환된 문자열
}

// 백엔드 Community 엔티티 (작성/수정 응답)
export interface CommunityDto {
  id: number;
  title: string;
  content: string;
  category: CommunityCategory;
  author: {
    id: number;
    nickname: string;
    name: string;
    email: string;
    school?: {
      id: number;
      name: string;
    } | null;
  };
  viewCount: number;
  createdAt: number[] | string; // LocalDateTime 배열 또는 이미 변환된 문자열
  updatedAt: number[] | string; // LocalDateTime 배열 또는 이미 변환된 문자열
}

// 백엔드 Comment 엔티티 (작성/수정 응답)
export interface CommentDto {
  id: number;
  content: string;
  author: {
    id: number;
    nickname: string;
    name: string;
    email: string;
    school?: {
      id: number;
      name: string;
    } | null;
  };
  communityId: number;
  createdAt: number[] | string; // LocalDateTime 배열 또는 이미 변환된 문자열
  updatedAt: number[] | string; // LocalDateTime 배열 또는 이미 변환된 문자열
}

// 타입 가드 함수들
export function isLocalDateTimeArray(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.length >= 3 &&
    value.every(item => typeof item === 'number')
  );
}

export function isStringDate(value: unknown): value is string {
  return typeof value === 'string';
}

// LocalDateTime 안전 변환 유틸리티
export function safeConvertDateTime(
  dateTime: number[] | string | undefined
): string {
  if (!dateTime) {
    // fallback: 현재 시간
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  }

  if (isStringDate(dateTime)) {
    return dateTime;
  }

  if (isLocalDateTimeArray(dateTime)) {
    return convertLocalDateTimeArrayToISO(dateTime);
  }

  // 타입이 맞지 않는 경우 현재 시간으로 폴백
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}
