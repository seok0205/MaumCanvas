import {
  COMMUNITY_ENDPOINTS,
  COMMUNITY_ERROR_MESSAGES,
} from '@/constants/community';
import type { ApiResponse } from '@/types/api';
import { AuthenticationError } from '@/types/auth';
import type {
  Comment,
  CommentListResponse,
  CommentWriteRequest,
  Community,
  PostListQuery,
  PostListResponse,
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
   * 게시글 목록 조회 (페이지네이션)
   * 백엔드: GET /community -> List<Community> 직접 반환 (ApiResponse 래핑 없음)
   */
  getPosts: async (
    query: PostListQuery = {},
    signal?: AbortSignal
  ): Promise<Community[]> => {
    try {
      const params = new URLSearchParams();

      if (query.lastId) params.append('lastId', query.lastId.toString());
      if (query.size) params.append('size', query.size.toString());

      const url = `${COMMUNITY_ENDPOINTS.GET_POSTS}${params.toString() ? '?' + params.toString() : ''}`;

      // 백엔드가 List<Community>를 직접 반환하므로 ApiResponse 래핑 없음
      const response = await apiClient.get<Community[]>(url, {
        ...(signal && { signal }),
      });

      if (!response.data) {
        throw new AuthenticationError(
          'POST_FETCH_FAILED',
          COMMUNITY_ERROR_MESSAGES.POST_FETCH_FAILED
        );
      }

      return response.data;
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

      // 네트워크 에러 처리
      const axiosError = error as AxiosError<ApiResponse<null>>;
      if (
        axiosError.code === 'NETWORK_ERROR' ||
        axiosError.code === 'ERR_NETWORK'
      ) {
        throw handleNetworkError(axiosError);
      }

      // HTTP 상태 코드 기반 에러 처리
      if (axiosError.response?.status) {
        throw handleHttpError(axiosError.response.status);
      }

      // API 에러 처리
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
   * 게시글 단건 조회
   */
  getPostById: async (
    id: number,
    signal?: AbortSignal
  ): Promise<PostListResponse> => {
    try {
      const response = await apiClient.get<ApiResponse<PostListResponse>>(
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
      return response.data.result || [];
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
      const response = await apiClient.post<ApiResponse<Comment>>(
        COMMUNITY_ENDPOINTS.CREATE_COMMENT(communityId),
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
