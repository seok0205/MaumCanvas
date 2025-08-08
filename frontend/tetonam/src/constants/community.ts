// const BASE_URL = 'https://i13e108.p.ssafy.io';

// 커뮤니티 관련 상수 정의
import type { CommunityCategory, PostSortType } from '@/types/community';

// 커뮤니티 API 엔드포인트
export const COMMUNITY_ENDPOINTS = {
  // 게시글 관련
  GET_POSTS: '/api/community',
  // 페이지네이션(페이지 번호 기반)
  GET_POSTS_PAGE: (page: number) => `/api/community/page/${page}`,
  // GET_POSTS: `${BASE_URL}/api/community`,
  GET_POST_BY_ID: (id: number) => `/api/community/${id}`,
  // GET_POST_BY_ID: (id: number) => `${BASE_URL}/api/community/${id}`,
  CREATE_POST: '/api/community',
  // CREATE_POST: `${BASE_URL}/api/community`,
  UPDATE_POST: (id: number) => `/api/community/${id}`,
  // UPDATE_POST: (id: number) => `${BASE_URL}/api/community/${id}`,
  DELETE_POST: (id: number) => `/api/community/${id}`,
  // DELETE_POST: (id: number) => `${BASE_URL}/api/community/${id}`,

  // 댓글 관련
  GET_COMMENTS: (communityId: number) =>
    `/api/community/${communityId}/comments`,
  // GET_COMMENTS: (communityId: number) =>
  //   `${BASE_URL}/api/community/${communityId}/comments`,
  CREATE_COMMENT: (communityId: number) =>
    `/api/community/${communityId}/comments`,
  // CREATE_COMMENT: (communityId: number) =>
  //   `${BASE_URL}/api/community/${communityId}/comments`,
  UPDATE_COMMENT: (communityId: number, commentId: number) =>
    `/api/community/${communityId}/comments/${commentId}`,
  // UPDATE_COMMENT: (communityId: number, commentId: number) =>
  //   `${BASE_URL}/api/community/${communityId}/comments/${commentId}`,
  DELETE_COMMENT: (communityId: number, commentId: number) =>
    `/api/community/${communityId}/comments/${commentId}`,
  // DELETE_COMMENT: (communityId: number, commentId: number) =>
  //   `${BASE_URL}/api/community/${communityId}/comments/${commentId}`,
} as const;

// 커뮤니티 기본 설정
export const COMMUNITY_CONFIG = {
  // 페이지네이션
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,

  // 컨텐츠 제한
  TITLE_MIN_LENGTH: 1,
  TITLE_MAX_LENGTH: 100,
  CONTENT_MIN_LENGTH: 1,
  CONTENT_MAX_LENGTH: 5000,
  COMMENT_MIN_LENGTH: 1,
  COMMENT_MAX_LENGTH: 1000,

  // 자동 새로고침 간격 (밀리초)
  AUTO_REFRESH_INTERVAL: 30000, // 30초

  // 디바운스 딜레이
  SEARCH_DEBOUNCE_DELAY: 300,
} as const;

// 커뮤니티 카테고리 옵션
export const COMMUNITY_CATEGORIES: Array<{
  value: CommunityCategory;
  label: string;
  description: string;
  icon?: string;
}> = [
  {
    value: 'GENERAL',
    label: '일반',
    description: '일반적인 주제에 대한 자유로운 이야기',
    icon: '💬',
  },
  {
    value: 'STUDY',
    label: '학업',
    description: '공부 관련 정보와 스터디 모집',
    icon: '📚',
  },
  {
    value: 'FRIENDSHIP',
    label: '친구관계',
    description: '친구 관계와 인간관계에 대한 이야기',
    icon: '👫',
  },
  {
    value: 'FAMILY',
    label: '가족',
    description: '가족 관계와 가정에 대한 이야기',
    icon: '👨‍👩‍👧‍�',
  },
  {
    value: 'SECRET',
    label: '비밀상담게시판',
    description: '익명으로 고민을 나누는 비밀 상담',
    icon: '🔒',
  },
] as const;

// 게시글 정렬 옵션
export const POST_SORT_OPTIONS: Array<{
  value: PostSortType;
  label: string;
  description: string;
}> = [
  {
    value: 'latest',
    label: '최신순',
    description: '최근에 작성된 순서로 정렬',
  },
  {
    value: 'popular',
    label: '인기순',
    description: '조회수가 높은 순서로 정렬',
  },
] as const;

// 에러 메시지
export const COMMUNITY_ERROR_MESSAGES = {
  // 네트워크 에러
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  SERVER_ERROR: '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',

  // 인증 에러
  UNAUTHORIZED: '로그인이 필요합니다.',
  FORBIDDEN: '권한이 없습니다.',

  // 게시글 관련 에러
  POST_NOT_FOUND: '게시글을 찾을 수 없습니다.',
  POST_CREATE_FAILED: '게시글 작성에 실패했습니다.',
  POST_UPDATE_FAILED: '게시글 수정에 실패했습니다.',
  POST_DELETE_FAILED: '게시글 삭제에 실패했습니다.',
  POST_FETCH_FAILED: '게시글을 불러오는데 실패했습니다.',

  // 댓글 관련 에러
  COMMENT_NOT_FOUND: '댓글을 찾을 수 없습니다.',
  COMMENT_CREATE_FAILED: '댓글 작성에 실패했습니다.',
  COMMENT_UPDATE_FAILED: '댓글 수정에 실패했습니다.',
  COMMENT_DELETE_FAILED: '댓글 삭제에 실패했습니다.',
  COMMENT_FETCH_FAILED: '댓글을 불러오는데 실패했습니다.',

  // 유효성 검사 에러
  TITLE_REQUIRED: '제목을 입력해주세요.',
  TITLE_TOO_LONG: `제목은 ${COMMUNITY_CONFIG.TITLE_MAX_LENGTH}자 이내로 입력해주세요.`,
  CONTENT_REQUIRED: '내용을 입력해주세요.',
  CONTENT_TOO_LONG: `내용은 ${COMMUNITY_CONFIG.CONTENT_MAX_LENGTH}자 이내로 입력해주세요.`,
  COMMENT_REQUIRED: '댓글 내용을 입력해주세요.',
  COMMENT_TOO_LONG: `댓글은 ${COMMUNITY_CONFIG.COMMENT_MAX_LENGTH}자 이내로 입력해주세요.`,
  CATEGORY_REQUIRED: '카테고리를 선택해주세요.',
  INVALID_CATEGORY: '올바른 카테고리를 선택해주세요.',

  // 권한 에러
  NOT_AUTHOR: '작성자만 수정/삭제할 수 있습니다.',

  // 일반 에러
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
  REQUEST_CANCELLED: '요청이 취소되었습니다.',
} as const;

// 성공 메시지
export const COMMUNITY_SUCCESS_MESSAGES = {
  POST_CREATED: '게시글이 성공적으로 작성되었습니다.',
  POST_UPDATED: '게시글이 성공적으로 수정되었습니다.',
  POST_DELETED: '게시글이 성공적으로 삭제되었습니다.',
  COMMENT_CREATED: '댓글이 성공적으로 작성되었습니다.',
  COMMENT_UPDATED: '댓글이 성공적으로 수정되었습니다.',
  COMMENT_DELETED: '댓글이 성공적으로 삭제되었습니다.',
} as const;

// React Query 키
export const COMMUNITY_QUERY_KEYS = {
  all: ['community'] as const,
  posts: () => [...COMMUNITY_QUERY_KEYS.all, 'posts'] as const,
  post: (id: number) => [...COMMUNITY_QUERY_KEYS.all, 'post', id] as const,
  postsList: (filters: {
    sort?: PostSortType;
    category?: CommunityCategory;
    lastId?: number;
    size?: number;
  }) => [...COMMUNITY_QUERY_KEYS.posts(), 'list', filters] as const,
  comments: (communityId: number) =>
    [...COMMUNITY_QUERY_KEYS.all, 'comments', communityId] as const,
} as const;

// 로컬 스토리지 키
export const COMMUNITY_STORAGE_KEYS = {
  DRAFT_POST: 'community_draft_post',
  DRAFT_COMMENT: (communityId: number) =>
    `community_draft_comment_${communityId}`,
  LAST_CATEGORY: 'community_last_category',
  POSTS_PER_PAGE: 'community_posts_per_page',
} as const;
