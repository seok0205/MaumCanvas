import {
  COMMUNITY_CONFIG,
  COMMUNITY_ERROR_MESSAGES,
} from '@/constants/community';
import type { CommunityCategory, PostSortType } from '@/types/community';
import { isValidCommunityCategory } from '@/types/community';

// === 유효성 검사 함수 ===

/**
 * 게시글 제목 유효성 검사
 */
export const validatePostTitle = (title: string): string | null => {
  if (!title || title.trim().length === 0) {
    return COMMUNITY_ERROR_MESSAGES.TITLE_REQUIRED;
  }

  if (title.trim().length > COMMUNITY_CONFIG.TITLE_MAX_LENGTH) {
    return COMMUNITY_ERROR_MESSAGES.TITLE_TOO_LONG;
  }

  return null;
};

/**
 * 게시글 내용 유효성 검사
 */
export const validatePostContent = (content: string): string | null => {
  if (!content || content.trim().length === 0) {
    return COMMUNITY_ERROR_MESSAGES.CONTENT_REQUIRED;
  }

  if (content.trim().length > COMMUNITY_CONFIG.CONTENT_MAX_LENGTH) {
    return COMMUNITY_ERROR_MESSAGES.CONTENT_TOO_LONG;
  }

  return null;
};

/**
 * 댓글 내용 유효성 검사
 */
export const validateCommentContent = (content: string): string | null => {
  if (!content || content.trim().length === 0) {
    return COMMUNITY_ERROR_MESSAGES.COMMENT_REQUIRED;
  }

  if (content.trim().length > COMMUNITY_CONFIG.COMMENT_MAX_LENGTH) {
    return COMMUNITY_ERROR_MESSAGES.COMMENT_TOO_LONG;
  }

  return null;
};

/**
 * 카테고리 유효성 검사
 */
export const validateCategory = (category: string): string | null => {
  if (!category) {
    return COMMUNITY_ERROR_MESSAGES.CATEGORY_REQUIRED;
  }

  // 중앙 타입 정의의 유효성 검사 함수 사용 (백엔드 enum과 동기화됨)
  if (!isValidCommunityCategory(category)) {
    return COMMUNITY_ERROR_MESSAGES.INVALID_CATEGORY;
  }

  return null;
};

// === 포맷팅 함수 ===

/**
 * 날짜를 상대적 시간으로 포맷팅 (예: "3분 전", "2시간 전", "3주 전", "5개월 전", "1년 전")
 * 요구 단위: 분 전, 시간 전, 일 전, 주 전, 개월 전, 년 전
 * 1분 미만 차이는 '1분 전'으로 표기 (사용자 요구: 1분전, 2분전 ... 형식)
 */
export const formatRelativeTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';
    const now = new Date();
    let diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 0) diffInSeconds = 0; // 미래 시간 보호

    const minute = 60;
    const hour = 60 * minute;
    const day = 24 * hour;
    const week = 7 * day;
    const month = 30 * day; // 평균 월 길이 (단순화)
    const year = 365 * day; // 윤년 무시 단순화

    if (diffInSeconds < minute) return '1분 전';
    if (diffInSeconds < hour)
      return `${Math.floor(diffInSeconds / minute)}분 전`;
    if (diffInSeconds < day)
      return `${Math.floor(diffInSeconds / hour)}시간 전`;
    if (diffInSeconds < week) return `${Math.floor(diffInSeconds / day)}일 전`;
    if (diffInSeconds < month)
      return `${Math.floor(diffInSeconds / week)}주 전`;
    if (diffInSeconds < year)
      return `${Math.floor(diffInSeconds / month)}개월 전`;
    return `${Math.floor(diffInSeconds / year)}년 전`;
  } catch {
    return '';
  }
};

/**
 * 조회수를 포맷팅 (예: 1234 -> "1.2K")
 */
export const formatViewCount = (count: number): string => {
  if (count < 1000) {
    return count.toString();
  }

  if (count < 1000000) {
    return `${(count / 1000).toFixed(1)}K`;
  }

  return `${(count / 1000000).toFixed(1)}M`;
};

/**
 * 텍스트를 지정된 길이로 잘라내기 (말줄임표 포함)
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength)}...`;
};

/**
 * HTML 태그 제거 (게시글 미리보기용)
 */
export const stripHtmlTags = (html: string): string => {
  return html.replace(/<[^>]*>/g, '').trim();
};

// === 로컬 스토리지 헬퍼 ===

/**
 * 게시글 임시저장
 */
export const saveDraftPost = (data: {
  title: string;
  content: string;
  category: CommunityCategory;
}): void => {
  try {
    localStorage.setItem(
      'community_draft_post',
      JSON.stringify({
        ...data,
        savedAt: new Date().toISOString(),
      })
    );
  } catch (error) {
    console.warn('게시글 임시저장 실패:', error);
  }
};

/**
 * 게시글 임시저장 불러오기
 */
export const loadDraftPost = (): {
  title: string;
  content: string;
  category: CommunityCategory;
  savedAt: string;
} | null => {
  try {
    const draft = localStorage.getItem('community_draft_post');
    if (!draft) return null;

    const parsed = JSON.parse(draft);

    // 24시간 이상 된 임시저장은 삭제
    const savedAt = new Date(parsed.savedAt);
    const now = new Date();
    const diffInHours = (now.getTime() - savedAt.getTime()) / (1000 * 60 * 60);

    if (diffInHours > 24) {
      localStorage.removeItem('community_draft_post');
      return null;
    }

    return parsed;
  } catch (error) {
    console.warn('게시글 임시저장 불러오기 실패:', error);
    return null;
  }
};

/**
 * 게시글 임시저장 삭제
 */
export const clearDraftPost = (): void => {
  try {
    localStorage.removeItem('community_draft_post');
  } catch (error) {
    console.warn('게시글 임시저장 삭제 실패:', error);
  }
};

/**
 * 댓글 임시저장
 */
export const saveDraftComment = (
  communityId: number,
  content: string
): void => {
  try {
    localStorage.setItem(
      `community_draft_comment_${communityId}`,
      JSON.stringify({
        content,
        savedAt: new Date().toISOString(),
      })
    );
  } catch (error) {
    console.warn('댓글 임시저장 실패:', error);
  }
};

/**
 * 댓글 임시저장 불러오기
 */
export const loadDraftComment = (
  communityId: number
): {
  content: string;
  savedAt: string;
} | null => {
  try {
    const draft = localStorage.getItem(
      `community_draft_comment_${communityId}`
    );
    if (!draft) return null;

    const parsed = JSON.parse(draft);

    // 1시간 이상 된 임시저장은 삭제
    const savedAt = new Date(parsed.savedAt);
    const now = new Date();
    const diffInHours = (now.getTime() - savedAt.getTime()) / (1000 * 60 * 60);

    if (diffInHours > 1) {
      localStorage.removeItem(`community_draft_comment_${communityId}`);
      return null;
    }

    return parsed;
  } catch (error) {
    console.warn('댓글 임시저장 불러오기 실패:', error);
    return null;
  }
};

/**
 * 댓글 임시저장 삭제
 */
export const clearDraftComment = (communityId: number): void => {
  try {
    localStorage.removeItem(`community_draft_comment_${communityId}`);
  } catch (error) {
    console.warn('댓글 임시저장 삭제 실패:', error);
  }
};

// === URL 헬퍼 함수 ===

/**
 * 커뮤니티 페이지 URL 생성
 */
export const getCommunityUrl = (params?: {
  category?: CommunityCategory;
  sort?: PostSortType;
  page?: number;
}): string => {
  const searchParams = new URLSearchParams();

  if (params?.category) searchParams.set('category', params.category);
  if (params?.sort) searchParams.set('sort', params.sort);
  if (params?.page) searchParams.set('page', params.page.toString());

  const queryString = searchParams.toString();
  return `/community${queryString ? `?${queryString}` : ''}`;
};

/**
 * 게시글 상세 페이지 URL 생성
 */
export const getPostUrl = (id: number): string => {
  return `/community/post/${id}`;
};

/**
 * 게시글 작성 페이지 URL 생성
 */
export const getPostWriteUrl = (category?: CommunityCategory): string => {
  return `/community/write${category ? `?category=${category}` : ''}`;
};

/**
 * 게시글 수정 페이지 URL 생성
 */
export const getPostEditUrl = (id: number): string => {
  return `/community/post/${id}/edit`;
};

// === 검색 및 필터링 헬퍼 ===

/**
 * 카테고리별 게시글 필터링
 */
export const filterPostsByCategory = <
  T extends { category: CommunityCategory },
>(
  posts: T[],
  category?: CommunityCategory
): T[] => {
  if (!category) return posts;
  return posts.filter(post => post.category === category);
};

/**
 * 검색어로 게시글 필터링
 */
export const searchPosts = <T extends { title: string; content: string }>(
  posts: T[],
  searchTerm: string
): T[] => {
  if (!searchTerm.trim()) return posts;

  const term = searchTerm.toLowerCase();
  return posts.filter(
    post =>
      post.title.toLowerCase().includes(term) ||
      stripHtmlTags(post.content).toLowerCase().includes(term)
  );
};

// === 에러 처리 헬퍼 ===

/**
 * 커뮤니티 관련 에러 메시지 추출
 */
export const getCommunityErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return COMMUNITY_ERROR_MESSAGES.UNKNOWN_ERROR;
};
