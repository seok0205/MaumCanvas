import {
  COMMUNITY_ENDPOINTS,
  COMMUNITY_ERROR_MESSAGES,
} from '@/constants/community';
import type { ApiResponse } from '@/types/api';
import { convertLocalDateTimeArrayToISO } from '@/types/api';
import { AuthenticationError } from '@/types/auth';
import type {
  Comment,
  CommentListResponse,
  CommentWriteRequest,
  Community,
  PostListQuery,
  PostListResponse,
  PostPageItem,
  PostUpdateRequest,
  PostWriteRequest,
} from '@/types/community';
import {
  handleApiError,
  handleHttpError,
  handleNetworkError,
} from '@/utils/errorHandler';
import type { AxiosError } from 'axios';
import { apiClient } from './apiClient';

// 커뮤니티 관련 API 서비스
export const communityService = {
  // === 게시글 관련 API ===

  /**
   * 게시글 목록 조회 (페이지 번호 기반)
   * 백엔드: GET /community/page/{number} -> Page<PostPageDto> 직렬화된 배열 형태 반환 가능
   * 프론트 목록 카드에서 author 전체를 요구하지 않도록 최소 필드만 사용합니다.
   */
  getPosts: async (
    query: PostListQuery = {},
    signal?: AbortSignal
  ): Promise<PostPageItem[]> => {
    try {
      // 페이지 번호는 커서 기반 파라미터 대신 number를 사용 (기본 0페이지)
      const pageNumber = query.lastId ? Number(query.lastId) : 0;
      const isSearch = !!query.nickname;
      const baseUrl = isSearch
        ? `${COMMUNITY_ENDPOINTS.GET_POSTS_PAGE(pageNumber)}/search`
        : COMMUNITY_ENDPOINTS.GET_POSTS_PAGE(pageNumber);
      const response = await apiClient.get<any>(baseUrl, {
        params: isSearch ? { nickname: query.nickname } : undefined,
        ...(signal && { signal }),
      });

      // Spring의 Page 직렬화는 { content: T[], ... } 또는 바로 배열일 수 있음.
      const data = response.data;
      const items: any[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
          ? data.content
          : [];

      // PostPageDto는 id,title,nickname,category만 포함하므로 상세 화면 데이터가 아님.
      // 목록 컴포넌트에서는 title/category/nickname만 사용하도록 했고, createdAt/viewCount는 없을 수 있음.
      return items.map(
        (item): PostPageItem => ({
          id: item.id,
          title: item.title,
          category: item.category,
          nickname: item.nickname,
          createdAt: item.createdAt || item.createdDate || undefined,
        })
      );
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AuthenticationError(
          'ABORTED',
          COMMUNITY_ERROR_MESSAGES.REQUEST_CANCELLED
        );
      }

      const axiosError = error as AxiosError<ApiResponse<null>>;
      if (
        axiosError.code === 'NETWORK_ERROR' ||
        axiosError.code === 'ERR_NETWORK'
      ) {
        throw handleNetworkError(axiosError);
      }

      if (axiosError.response?.data) {
        const apiError = axiosError.response.data;
        if (apiError.code === 'POST_LIST_EMPTY') {
          // 빈 목록은 UI에서 빈 상태 카드로 처리 (예외 아님)
          return [];
        }
        throw handleApiError(apiError);
      }

      if (axiosError.response?.status) {
        throw handleHttpError(axiosError.response.status);
      }

      throw new AuthenticationError(
        'POST_FETCH_FAILED',
        COMMUNITY_ERROR_MESSAGES.POST_FETCH_FAILED
      );
    }
  },

  /**
   * 게시글 단건 조회
   */
  getPostById: async (
    id: number,
    signal?: AbortSignal
  ): Promise<PostListResponse> => {
    try {
      const response = await apiClient.get<ApiResponse<any>>(
        COMMUNITY_ENDPOINTS.GET_POST_BY_ID(id),
        {
          ...(signal && { signal }),
        }
      );

      if (!response.data.isSuccess || !response.data.result) {
        throw new AuthenticationError(
          response.data.code || 'POST_NOT_FOUND',
          COMMUNITY_ERROR_MESSAGES.POST_NOT_FOUND
        );
      }

      const raw = response.data.result as any;
      
      // LocalDateTime 배열을 문자열로 변환하는 함수
      const convertDateTime = (dateField: any): string => {
        if (Array.isArray(dateField)) {
          // LocalDateTime 배열인 경우 ISO 문자열로 변환
          try {
            return convertLocalDateTimeArrayToISO(dateField);
          } catch (error) {
            console.warn('날짜 배열 변환 실패:', error);
            return new Date().toISOString();
          }
        }
        if (typeof dateField === 'string') {
          return dateField;
        }
        // fallback: 현재 시간
        return new Date().toISOString();
      };

      const normalized: PostListResponse = {
        id: raw.id,
        title: raw.title,
        content: raw.content ?? '',
        category: raw.category,
        nickname: raw.nickname,
        viewCount: raw.viewCount ?? 0,
        createdAt: convertDateTime(raw.createdAt || raw.createdDate),
        updatedAt: convertDateTime(raw.updatedAt || raw.modifiedDate),
      };

      return normalized;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AuthenticationError(
          'ABORTED',
          COMMUNITY_ERROR_MESSAGES.REQUEST_CANCELLED
        );
      }

      const axiosError = error as AxiosError<ApiResponse<null>>;
      if (
        axiosError.code === 'NETWORK_ERROR' ||
        axiosError.code === 'ERR_NETWORK'
      ) {
        throw handleNetworkError(axiosError);
      }

      if (axiosError.response?.status === 404) {
        throw new AuthenticationError(
          'POST_NOT_FOUND',
          COMMUNITY_ERROR_MESSAGES.POST_NOT_FOUND
        );
      }

      if (axiosError.response?.status) {
        throw handleHttpError(axiosError.response.status);
      }

      if (axiosError.response?.data) {
        throw handleApiError(axiosError.response.data);
      }

      throw new AuthenticationError(
        'POST_FETCH_FAILED',
        COMMUNITY_ERROR_MESSAGES.POST_FETCH_FAILED
      );
    }
  },

  /**
   * 게시글 작성
   */
  createPost: async (
    data: PostWriteRequest,
    signal?: AbortSignal
  ): Promise<Community> => {
    try {
      const response = await apiClient.post<ApiResponse<Community>>(
        COMMUNITY_ENDPOINTS.CREATE_POST,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          ...(signal && { signal }),
        }
      );

      if (!response.data.isSuccess || !response.data.result) {
        throw new AuthenticationError(
          response.data.code || 'POST_CREATE_FAILED',
          COMMUNITY_ERROR_MESSAGES.POST_CREATE_FAILED
        );
      }

      return response.data.result;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AuthenticationError(
          'ABORTED',
          COMMUNITY_ERROR_MESSAGES.REQUEST_CANCELLED
        );
      }

      const axiosError = error as AxiosError<ApiResponse<null>>;
      if (
        axiosError.code === 'NETWORK_ERROR' ||
        axiosError.code === 'ERR_NETWORK'
      ) {
        throw handleNetworkError(axiosError);
      }

      if (axiosError.response?.status) {
        throw handleHttpError(axiosError.response.status);
      }

      if (axiosError.response?.data) {
        const apiError = axiosError.response.data;
        // 특정 에러 코드 처리
        switch (apiError.code) {
          case 'COMMON400':
            throw new AuthenticationError(
              'VALIDATION_ERROR',
              '입력 정보를 확인해주세요.'
            );
          case 'USER_NOT_MATCH':
            throw new AuthenticationError(
              'UNAUTHORIZED',
              COMMUNITY_ERROR_MESSAGES.UNAUTHORIZED
            );
          default:
            throw handleApiError(apiError);
        }
      }

      throw new AuthenticationError(
        'POST_CREATE_FAILED',
        COMMUNITY_ERROR_MESSAGES.POST_CREATE_FAILED
      );
    }
  },

  /**
   * 게시글 수정
   */
  updatePost: async (
    id: number,
    data: PostUpdateRequest,
    signal?: AbortSignal
  ): Promise<Community> => {
    try {
      const response = await apiClient.put<ApiResponse<Community>>(
        COMMUNITY_ENDPOINTS.UPDATE_POST(id),
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          ...(signal && { signal }),
        }
      );

      if (!response.data.isSuccess || !response.data.result) {
        throw new AuthenticationError(
          response.data.code || 'POST_UPDATE_FAILED',
          COMMUNITY_ERROR_MESSAGES.POST_UPDATE_FAILED
        );
      }

      return response.data.result;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AuthenticationError(
          'ABORTED',
          COMMUNITY_ERROR_MESSAGES.REQUEST_CANCELLED
        );
      }

      const axiosError = error as AxiosError<ApiResponse<null>>;
      if (
        axiosError.code === 'NETWORK_ERROR' ||
        axiosError.code === 'ERR_NETWORK'
      ) {
        throw handleNetworkError(axiosError);
      }

      if (axiosError.response?.status) {
        throw handleHttpError(axiosError.response.status);
      }

      if (axiosError.response?.data) {
        const apiError = axiosError.response.data;
        switch (apiError.code) {
          case 'POST_LIST_EMPTY':
            throw new AuthenticationError(
              'POST_NOT_FOUND',
              COMMUNITY_ERROR_MESSAGES.POST_NOT_FOUND
            );
          case 'USER_NOT_MATCH':
            throw new AuthenticationError(
              'NOT_AUTHOR',
              COMMUNITY_ERROR_MESSAGES.NOT_AUTHOR
            );
          default:
            throw handleApiError(apiError);
        }
      }

      throw new AuthenticationError(
        'POST_UPDATE_FAILED',
        COMMUNITY_ERROR_MESSAGES.POST_UPDATE_FAILED
      );
    }
  },

  /**
   * 게시글 삭제
   */
  deletePost: async (id: number, signal?: AbortSignal): Promise<void> => {
    try {
      const response = await apiClient.delete(
        COMMUNITY_ENDPOINTS.DELETE_POST(id),
        {
          ...(signal && { signal }),
        }
      );

      // 204 No Content는 성공으로 처리
      if (response.status !== 204) {
        throw new AuthenticationError(
          'POST_DELETE_FAILED',
          COMMUNITY_ERROR_MESSAGES.POST_DELETE_FAILED
        );
      }
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AuthenticationError(
          'ABORTED',
          COMMUNITY_ERROR_MESSAGES.REQUEST_CANCELLED
        );
      }

      const axiosError = error as AxiosError<ApiResponse<null>>;
      if (
        axiosError.code === 'NETWORK_ERROR' ||
        axiosError.code === 'ERR_NETWORK'
      ) {
        throw handleNetworkError(axiosError);
      }

      if (axiosError.response?.status) {
        throw handleHttpError(axiosError.response.status);
      }

      if (axiosError.response?.data) {
        const apiError = axiosError.response.data;
        switch (apiError.code) {
          case 'POST_LIST_EMPTY':
            throw new AuthenticationError(
              'POST_NOT_FOUND',
              COMMUNITY_ERROR_MESSAGES.POST_NOT_FOUND
            );
          case 'USER_NOT_MATCH':
            throw new AuthenticationError(
              'NOT_AUTHOR',
              COMMUNITY_ERROR_MESSAGES.NOT_AUTHOR
            );
          default:
            throw handleApiError(apiError);
        }
      }

      throw new AuthenticationError(
        'POST_DELETE_FAILED',
        COMMUNITY_ERROR_MESSAGES.POST_DELETE_FAILED
      );
    }
  },

  // === 댓글 관련 API ===

  /**
   * 댓글 목록 조회
   */
  getComments: async (
    communityId: number,
    signal?: AbortSignal
  ): Promise<CommentListResponse[]> => {
    try {
      const response = await apiClient.get<ApiResponse<CommentListResponse[]>>(
        COMMUNITY_ENDPOINTS.GET_COMMENTS(communityId),
        {
          ...(signal && { signal }),
        }
      );

      if (!response.data.isSuccess) {
        throw new AuthenticationError(
          response.data.code || 'COMMENT_FETCH_FAILED',
          COMMUNITY_ERROR_MESSAGES.COMMENT_FETCH_FAILED
        );
      }

      // 댓글이 없는 경우 빈 배열 반환
      const raw = response.data.result || [];
      
      return raw.map((item: any) => {
        // LocalDateTime 배열을 문자열로 변환하는 함수
        const convertDateTime = (dateField: any): string => {
          if (Array.isArray(dateField)) {
            // LocalDateTime 배열인 경우 ISO 문자열로 변환
            try {
              return convertLocalDateTimeArrayToISO(dateField);
            } catch (error) {
              console.warn('날짜 배열 변환 실패:', error);
              return new Date().toISOString();
            }
          }
          if (typeof dateField === 'string') {
            return dateField;
          }
          // fallback: 현재 시간
          return new Date().toISOString();
        };

        return {
          id: item.id,
          content: item.content,
          nickname: item.nickname,
          communityId: item.communityId ?? communityId,
          createdAt: convertDateTime(item.createdAt),
          updatedAt: convertDateTime(item.updatedAt),
        };
      });
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AuthenticationError(
          'ABORTED',
          COMMUNITY_ERROR_MESSAGES.REQUEST_CANCELLED
        );
      }

      const axiosError = error as AxiosError<ApiResponse<null>>;
      if (
        axiosError.code === 'NETWORK_ERROR' ||
        axiosError.code === 'ERR_NETWORK'
      ) {
        throw handleNetworkError(axiosError);
      }

      if (axiosError.response?.status) {
        throw handleHttpError(axiosError.response.status);
      }

      if (axiosError.response?.data) {
        throw handleApiError(axiosError.response.data);
      }

      throw new AuthenticationError(
        'COMMENT_FETCH_FAILED',
        COMMUNITY_ERROR_MESSAGES.COMMENT_FETCH_FAILED
      );
    }
  },

  /**
   * 댓글 작성
   */
  createComment: async (
    communityId: number,
    data: CommentWriteRequest,
    signal?: AbortSignal
  ): Promise<Comment> => {
    try {
      // 백엔드가 @RequestBody String commentBody를 기대하므로 순수 텍스트로 전송
      const response = await apiClient.post<ApiResponse<Comment>>(
        COMMUNITY_ENDPOINTS.CREATE_COMMENT(communityId),
        data.content,
        {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
          },
          ...(signal && { signal }),
        }
      );

      if (!response.data.isSuccess || !response.data.result) {
        throw new AuthenticationError(
          response.data.code || 'COMMENT_CREATE_FAILED',
          COMMUNITY_ERROR_MESSAGES.COMMENT_CREATE_FAILED
        );
      }

      return response.data.result;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AuthenticationError(
          'ABORTED',
          COMMUNITY_ERROR_MESSAGES.REQUEST_CANCELLED
        );
      }

      const axiosError = error as AxiosError<ApiResponse<null>>;
      if (
        axiosError.code === 'NETWORK_ERROR' ||
        axiosError.code === 'ERR_NETWORK'
      ) {
        throw handleNetworkError(axiosError);
      }

      if (axiosError.response?.status) {
        throw handleHttpError(axiosError.response.status);
      }

      if (axiosError.response?.data) {
        const apiError = axiosError.response.data;
        switch (apiError.code) {
          case 'POST_LIST_EMPTY':
            throw new AuthenticationError(
              'POST_NOT_FOUND',
              COMMUNITY_ERROR_MESSAGES.POST_NOT_FOUND
            );
          case 'COMMENT_LIST_EMPTY':
            throw new AuthenticationError(
              'COMMENT_NOT_FOUND',
              COMMUNITY_ERROR_MESSAGES.COMMENT_NOT_FOUND
            );
          default:
            throw handleApiError(apiError);
        }
      }

      throw new AuthenticationError(
        'COMMENT_CREATE_FAILED',
        COMMUNITY_ERROR_MESSAGES.COMMENT_CREATE_FAILED
      );
    }
  },

  /**
   * 댓글 수정
   */
  updateComment: async (
    communityId: number,
    commentId: number,
    data: CommentWriteRequest,
    signal?: AbortSignal
  ): Promise<Comment> => {
    try {
      const response = await apiClient.put<ApiResponse<Comment>>(
        COMMUNITY_ENDPOINTS.UPDATE_COMMENT(communityId, commentId),
        data.content,
        {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
          },
          ...(signal && { signal }),
        }
      );

      if (!response.data.isSuccess || !response.data.result) {
        throw new AuthenticationError(
          response.data.code || 'COMMENT_UPDATE_FAILED',
          COMMUNITY_ERROR_MESSAGES.COMMENT_UPDATE_FAILED
        );
      }

      return response.data.result;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AuthenticationError(
          'ABORTED',
          COMMUNITY_ERROR_MESSAGES.REQUEST_CANCELLED
        );
      }

      const axiosError = error as AxiosError<ApiResponse<null>>;
      if (
        axiosError.code === 'NETWORK_ERROR' ||
        axiosError.code === 'ERR_NETWORK'
      ) {
        throw handleNetworkError(axiosError);
      }

      if (axiosError.response?.status) {
        throw handleHttpError(axiosError.response.status);
      }

      if (axiosError.response?.data) {
        const apiError = axiosError.response.data;
        switch (apiError.code) {
          case 'COMMENT_LIST_EMPTY':
            throw new AuthenticationError(
              'COMMENT_NOT_FOUND',
              COMMUNITY_ERROR_MESSAGES.COMMENT_NOT_FOUND
            );
          case 'USER_NOT_MATCH':
            throw new AuthenticationError(
              'NOT_AUTHOR',
              COMMUNITY_ERROR_MESSAGES.NOT_AUTHOR
            );
          default:
            throw handleApiError(apiError);
        }
      }

      throw new AuthenticationError(
        'COMMENT_UPDATE_FAILED',
        COMMUNITY_ERROR_MESSAGES.COMMENT_UPDATE_FAILED
      );
    }
  },

  /**
   * 댓글 삭제
   */
  deleteComment: async (
    communityId: number,
    commentId: number,
    signal?: AbortSignal
  ): Promise<void> => {
    try {
      const response = await apiClient.delete(
        COMMUNITY_ENDPOINTS.DELETE_COMMENT(communityId, commentId),
        {
          ...(signal && { signal }),
        }
      );

      // 204 No Content는 성공으로 처리
      if (response.status !== 204) {
        throw new AuthenticationError(
          'COMMENT_DELETE_FAILED',
          COMMUNITY_ERROR_MESSAGES.COMMENT_DELETE_FAILED
        );
      }
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AuthenticationError(
          'ABORTED',
          COMMUNITY_ERROR_MESSAGES.REQUEST_CANCELLED
        );
      }

      const axiosError = error as AxiosError<ApiResponse<null>>;
      if (
        axiosError.code === 'NETWORK_ERROR' ||
        axiosError.code === 'ERR_NETWORK'
      ) {
        throw handleNetworkError(axiosError);
      }

      if (axiosError.response?.status) {
        throw handleHttpError(axiosError.response.status);
      }

      if (axiosError.response?.data) {
        const apiError = axiosError.response.data;
        switch (apiError.code) {
          case 'COMMENT_LIST_EMPTY':
            throw new AuthenticationError(
              'COMMENT_NOT_FOUND',
              COMMUNITY_ERROR_MESSAGES.COMMENT_NOT_FOUND
            );
          case 'USER_NOT_MATCH':
            throw new AuthenticationError(
              'NOT_AUTHOR',
              COMMUNITY_ERROR_MESSAGES.NOT_AUTHOR
            );
          default:
            throw handleApiError(apiError);
        }
      }

      throw new AuthenticationError(
        'COMMENT_DELETE_FAILED',
        COMMUNITY_ERROR_MESSAGES.COMMENT_DELETE_FAILED
      );
    }
  },
};
