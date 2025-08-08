// 커뮤니티 관련 타입 정의 - 백엔드 API 스펙 기반
import type { ApiResponse } from './api';

// 커뮤니티 카테고리 타입 (백엔드 enum과 일치)
export type CommunityCategory =
  | 'GENERAL'
  | 'STUDY'
  | 'FRIENDSHIP'
  | 'FAMILY'
  | 'SECRET';

// 게시글 기본 타입 (백엔드 Community 엔티티와 일치)
export interface Community {
  readonly id: number;
  title: string;
  content: string;
  author: {
    readonly id: number;
    nickname: string;
    name: string;
    email: string;
    school?: {
      id: number;
      name: string;
    } | null;
  };
  category: CommunityCategory;
  viewCount: number;
  readonly createdAt: string; // ISO 8601 형식
  readonly updatedAt: string; // ISO 8601 형식
}

// 댓글 타입
export interface Comment {
  readonly id: number;
  content: string;
  author: {
    readonly id: number;
    nickname: string;
    name: string;
    email: string;
    school?: {
      id: number;
      name: string;
    } | null;
  };
  readonly communityId: number;
  readonly createdAt: string; // ISO 8601 형식
  readonly updatedAt: string; // ISO 8601 형식
}

// === API 요청/응답 타입 ===

// 게시글 작성 요청
export interface PostWriteRequest {
  title: string;
  content: string;
  category: CommunityCategory;
}

// 게시글 수정 요청
export interface PostUpdateRequest {
  title: string;
  content: string;
}

// 댓글 작성/수정 요청
export interface CommentWriteRequest {
  content: string;
}

// 게시글 목록 조회 응답 (PostListDto - 백엔드와 일치)
export interface PostListResponse {
  readonly id: number;
  title: string;
  content: string;
  category: CommunityCategory;
  nickname: string; // 백엔드 PostListDto와 일치 (nickname만 포함)
  viewCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// 댓글 목록 조회 응답 (CommentListDto - 백엔드와 일치)
export interface CommentListResponse {
  readonly id: number;
  content: string;
  nickname: string; // 백엔드 CommentListDto와 일치 (nickname만 포함)
  readonly communityId: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// === 페이지네이션 관련 타입 ===

// 커서 기반 페이지네이션 요청
export interface CursorPaginationRequest {
  lastId?: number;
  size?: number;
}

// 커서 기반 페이지네이션 응답
export interface CursorPaginatedResponse<T> extends ApiResponse<T[]> {
  result: T[] | null;
  pagination?: {
    hasNext: boolean;
    nextCursor?: number;
    size: number;
  };
}

// === 정렬 및 필터링 타입 ===

// 게시글 정렬 옵션
export type PostSortType = 'latest' | 'popular';

// 게시글 목록 조회 쿼리
export interface PostListQuery {
  sort?: PostSortType;
  category?: CommunityCategory;
  lastId?: number;
  size?: number;
}

// === 유효성 검사 헬퍼 ===

// 카테고리 유효성 검사
export const isValidCommunityCategory = (
  category: any
): category is CommunityCategory => {
  return ['GENERAL', 'STUDY', 'FRIENDSHIP', 'FAMILY', 'SECRET'].includes(
    category
  );
};

// 정렬 타입 유효성 검사
export const isValidPostSortType = (sort: any): sort is PostSortType => {
  return ['latest', 'popular'].includes(sort);
};

// 게시글 데이터 유효성 검사
export const isValidPostData = (post: any): post is Community => {
  return (
    post &&
    typeof post === 'object' &&
    typeof post.id === 'number' &&
    post.id > 0 &&
    typeof post.title === 'string' &&
    post.title.trim().length > 0 &&
    typeof post.content === 'string' &&
    post.content.trim().length > 0 &&
    post.author &&
    typeof post.author.id === 'number' &&
    typeof post.author.nickname === 'string' &&
    isValidCommunityCategory(post.category) &&
    typeof post.viewCount === 'number' &&
    typeof post.createdAt === 'string' &&
    typeof post.updatedAt === 'string'
  );
};

// 댓글 데이터 유효성 검사
export const isValidCommentData = (comment: any): comment is Comment => {
  return (
    comment &&
    typeof comment === 'object' &&
    typeof comment.id === 'number' &&
    comment.id > 0 &&
    typeof comment.content === 'string' &&
    comment.content.trim().length > 0 &&
    comment.author &&
    typeof comment.author.id === 'number' &&
    typeof comment.author.nickname === 'string' &&
    typeof comment.communityId === 'number' &&
    typeof comment.createdAt === 'string' &&
    typeof comment.updatedAt === 'string'
  );
};

// === 상수 ===

// 페이지네이션 기본값
export const COMMUNITY_PAGINATION = {
  DEFAULT_SIZE: 10,
  MAX_SIZE: 50,
} as const;

// 게시글/댓글 제한
export const COMMUNITY_LIMITS = {
  TITLE_MIN_LENGTH: 1,
  TITLE_MAX_LENGTH: 100,
  CONTENT_MIN_LENGTH: 1,
  CONTENT_MAX_LENGTH: 5000,
  COMMENT_MAX_LENGTH: 1000,
} as const;

// 카테고리 라벨 매핑
export const CATEGORY_LABELS: Record<CommunityCategory, string> = {
  GENERAL: '일반',
  STUDY: '학업',
  FRIENDSHIP: '친구관계',
  FAMILY: '가족',
  SECRET: '비밀상담게시판',
} as const;

// 정렬 라벨 매핑
export const SORT_LABELS: Record<PostSortType, string> = {
  latest: '최신순',
  popular: '인기순',
} as const;
