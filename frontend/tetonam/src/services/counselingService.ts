import type {
  ApiResponse,
  CounselingHistory,
  CounselingReservationRequest,
  CounselorInfo,
  RawUpcomingCounseling,
  UpcomingCounseling,
} from '@/types/api';
import {
  convertLocalDateTimeArrayToISO,
  isValidRawUpcomingCounseling,
  isValidUpcomingCounseling,
  transformRawToCounseling,
} from '@/types/api';
import { AuthenticationError } from '@/types/auth';
import {
  handleApiError,
  handleHttpError,
  handleNetworkError,
} from '@/utils/errorHandler';
import type { AxiosError } from 'axios';
import { apiClient } from './apiClient';
// 상담 상세/목록(상담사/학생) DTO 타입 정의
interface CounselorCounselingListItem {
  id: number;
  student: string;
  time: number[] | string; // LocalDateTime 배열 또는 ISO 문자열
  type: string;
  status: string;
}

interface StudentCounselingListItem {
  id: number;
  name: string; // 상담사 이름
  time: number[] | string; // LocalDateTime 배열 또는 ISO 문자열
  type: string;
  status: string;
}

interface CounselingDetailDto {
  name: string;
  school: string;
  email: string;
  phone: string;
  time: number[] | string; // LocalDateTime 배열 또는 ISO 문자열
  type: string;
  status: string;
}

// const BASE_URL = 'https://i13e108.p.ssafy.io'; // 현재 사용하지 않음

// 상담 관련 API 엔드포인트
const COUNSELING_ENDPOINTS = {
  GET_AVAILABLE_COUNSELORS: '/api/counseling',
  // GET_AVAILABLE_COUNSELORS: `${BASE_URL}/api/counseling`,
  RESERVE_COUNSELING: '/api/counseling',
  // RESERVE_COUNSELING: `${BASE_URL}/api/counseling`,
  GET_MY_COUNSELING: '/api/counseling/my-counseling',
  // GET_MY_COUNSELING: `${BASE_URL}/api/counseling/my-counseling`,
  GET_RECENT_COUNSELING: '/api/counseling/my-counseling-recent',
  // GET_RECENT_COUNSELING: `${BASE_URL}/api/counseling/my-counseling-recent`,
  GET_UPCOMING_COUNSELING: '/api/counseling/my-counseling-recent',
  // GET_UPCOMING_COUNSELING: `${BASE_URL}/api/counseling/my-counseling-recent`,
  // === 예상되는 "상담사 전용" API (백엔드 구현 예정) ===
  // 상담사가 가장 가까운 상담 1건 (학생 이름 포함 예상)
  GET_COUNSELOR_UPCOMING: '/api/counseling/counselor-recent',
  // 상담사 자신의 상담 목록 (학생 정보 목록 예상)
  GET_COUNSELOR_HISTORY: '/api/counseling/my-counseling-counselor',
  // 학생 자신의 상담 목록
  GET_STUDENT_HISTORY: '/api/counseling/my-counseling-student',
  // 공통 상세 조회
  GET_DETAIL: (id: number | string) => `/api/counseling/my-counseling/${id}`,
} as const;

// 상담 관련 API 서비스
export const counselingService = {
  // 가능한 상담사 조회
  getAvailableCounselors: async (
    time: string,
    signal?: AbortSignal
  ): Promise<CounselorInfo[]> => {
    try {
      const response = await apiClient.get<ApiResponse<CounselorInfo[]>>(
        `${COUNSELING_ENDPOINTS.GET_AVAILABLE_COUNSELORS}?time=${encodeURIComponent(time)}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          ...(signal && { signal }),
        }
      );

      if (!response.data.isSuccess || !response.data.result) {
        throw new AuthenticationError(
          response.data.code || 'COUNSELOR_FETCH_FAILED',
          '상담사 조회에 실패했습니다. 다시 시도해주세요.'
        );
      }

      return response.data.result;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AuthenticationError('ABORTED', '요청이 취소되었습니다.');
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
        'COUNSELOR_FETCH_FAILED',
        '상담사 조회에 실패했습니다. 다시 시도해주세요.'
      );
    }
  },

  // 상담 예약
  reserveCounseling: async (
    data: CounselingReservationRequest,
    signal?: AbortSignal
  ): Promise<string> => {
    try {
      const response = await apiClient.post<ApiResponse<string>>(
        COUNSELING_ENDPOINTS.RESERVE_COUNSELING,
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
          response.data.code || 'COUNSELING_RESERVE_FAILED',
          '상담 예약에 실패했습니다. 다시 시도해주세요.'
        );
      }

      return response.data.result;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AuthenticationError('ABORTED', '요청이 취소되었습니다.');
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

      // 상담 예약 특화 에러 처리
      if (axiosError.response?.data) {
        const apiError = axiosError.response.data;

        // === 백엔드 실제 에러 코드 매핑 (ErrorStatus 참고) ===
        // COMMON500 이지만 result 메시지에 "Query did not return a unique result" 가 포함되면
        // DrawingList 중복(그림 여러 번 저장)으로 인해 findLatestByUser 쿼리가 단일 결과를
        // 기대하다가 2개 이상을 반환한 경우다. (백엔드 DrawingListRepository.findLatestByUser)
        const apiErrorResultStr =
          typeof apiError.result === 'string'
            ? apiError.result
            : Array.isArray(apiError.result) || apiError.result == null
              ? ''
              : String(apiError.result);
        if (
          apiError.code === 'COMMON500' &&
          apiErrorResultStr.includes('Query did not return a unique result')
        ) {
          throw new AuthenticationError(
            'DUPLICATE_DRAWING_DATA',
            '그림 데이터가 중복되어 상담 예약을 진행할 수 없습니다. 관리자에게 문의하거나, 중복 그림 데이터를 정리한 후 다시 시도해주세요.'
          );
        }

        // COUNSELING4003: 학생이 그림을 그리지 않음
        if (apiError.code === 'COUNSELING4003') {
          throw new AuthenticationError(
            'DRAWING_REQUIRED',
            '상담 예약을 위해 그림 그리기를 먼저 완료해주세요.'
          );
        }

        // COUNSELING4000: 이미 예약된 시간
        if (apiError.code === 'COUNSELING4000') {
          throw new AuthenticationError(
            'TIME_ALREADY_RESERVED',
            '선택한 시간에 이미 예약이 있습니다. 다른 시간을 선택해주세요.'
          );
        }

        throw handleApiError(axiosError.response.data);
      }

      throw new AuthenticationError(
        'COUNSELING_RESERVE_FAILED',
        '상담 예약에 실패했습니다. 다시 시도해주세요.'
      );
    }
  },

  // 내 상담 내역 조회
  getMyCounselingHistory: async (
    signal?: AbortSignal
  ): Promise<CounselingHistory[]> => {
    try {
      const response = await apiClient.get<ApiResponse<CounselingHistory[]>>(
        COUNSELING_ENDPOINTS.GET_MY_COUNSELING,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          ...(signal && { signal }),
        }
      );

      if (!response.data.isSuccess || !response.data.result) {
        throw new AuthenticationError(
          response.data.code || 'COUNSELING_HISTORY_FETCH_FAILED',
          '상담 내역 조회에 실패했습니다. 다시 시도해주세요.'
        );
      }

      return response.data.result;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AuthenticationError('ABORTED', '요청이 취소되었습니다.');
      }

      // 네트워크 에러 처리
      const axiosError = error as AxiosError<ApiResponse<null>>;
      if (
        axiosError.code === 'NETWORK_ERROR' ||
        axiosError.code === 'ERR_NETWORK'
      ) {
        throw new AuthenticationError(
          'NETWORK_ERROR',
          '네트워크 연결을 확인해주세요.'
        );
      }

      // API 에러 처리
      if (axiosError.response?.data) {
        const apiError = axiosError.response.data;
        switch (apiError.code) {
          case 'COUNSELING4001': // 상담예약이 없습니다
          case 'COMMON400': // 잘못된 요청입니다
          case 'COMMON401': // 인증이 필요합니다
          case 'COMMON403': // 금지된 요청입니다
          case 'COMMON500': // 서버 에러
          default:
            throw new AuthenticationError(
              apiError.code || 'COUNSELING_HISTORY_FETCH_FAILED',
              '상담 내역 조회에 실패했습니다. 다시 시도해주세요.'
            );
        }
      }

      throw new AuthenticationError(
        'COUNSELING_HISTORY_FETCH_FAILED',
        '상담 내역 조회에 실패했습니다. 다시 시도해주세요.'
      );
    }
  },

  // 최근 상담 내역 조회
  getRecentCounseling: async (
    signal?: AbortSignal
  ): Promise<CounselingHistory | null> => {
    try {
      const response = await apiClient.get<ApiResponse<CounselingHistory>>(
        COUNSELING_ENDPOINTS.GET_RECENT_COUNSELING,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          ...(signal && { signal }),
        }
      );

      if (!response.data.isSuccess) {
        throw new AuthenticationError(
          response.data.code || 'RECENT_COUNSELING_FETCH_FAILED',
          '최근 상담 내역 조회에 실패했습니다. 다시 시도해주세요.'
        );
      }

      return response.data.result;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AuthenticationError('ABORTED', '요청이 취소되었습니다.');
      }

      // 네트워크 에러 처리
      const axiosError = error as AxiosError<ApiResponse<null>>;
      if (
        axiosError.code === 'NETWORK_ERROR' ||
        axiosError.code === 'ERR_NETWORK'
      ) {
        throw new AuthenticationError(
          'NETWORK_ERROR',
          '네트워크 연결을 확인해주세요.'
        );
      }

      // API 에러 처리
      if (axiosError.response?.data) {
        const apiError = axiosError.response.data;
        switch (apiError.code) {
          case 'COUNSELING4001': // 상담예약이 없습니다
          case 'COMMON400': // 잘못된 요청입니다
          case 'COMMON401': // 인증이 필요합니다
          case 'COMMON403': // 금지된 요청입니다
          case 'COMMON500': // 서버 에러
          default:
            throw new AuthenticationError(
              apiError.code || 'RECENT_COUNSELING_FETCH_FAILED',
              '최근 상담 내역 조회에 실패했습니다. 다시 시도해주세요.'
            );
        }
      }

      throw new AuthenticationError(
        'RECENT_COUNSELING_FETCH_FAILED',
        '최근 상담 내역 조회에 실패했습니다. 다시 시도해주세요.'
      );
    }
  },

  // 다가오는 상담 조회 (my-counseling-recent API) - 개선된 버전
  getUpcomingCounseling: async (
    signal?: AbortSignal
  ): Promise<UpcomingCounseling | null> => {
    try {
      const response = await apiClient.get<ApiResponse<RawUpcomingCounseling>>(
        COUNSELING_ENDPOINTS.GET_UPCOMING_COUNSELING,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          ...(signal && { signal }),
        }
      );

      // 응답 성공 여부 확인
      if (!response.data.isSuccess) {
        // 상담예약이 없는 경우는 null을 반환 (에러가 아님)
        if (response.data.code === 'COUNSELING4001') {
          return null;
        }

        // 기타 API 에러 처리
        throw new AuthenticationError(
          response.data.code || 'UPCOMING_COUNSELING_FETCH_FAILED',
          response.data.message ||
            '다가오는 상담 조회에 실패했습니다. 다시 시도해주세요.'
        );
      }

      // 백엔드 원시 데이터 타입 검증
      const rawResult = response.data.result;
      if (!rawResult) {
        return null;
      }

      if (!isValidRawUpcomingCounseling(rawResult)) {
        throw new AuthenticationError(
          'INVALID_DATA_FORMAT',
          '잘못된 형식의 데이터를 받았습니다. 다시 시도해주세요.'
        );
      }

      // 원시 데이터를 프론트엔드용으로 변환
      const transformedResult = transformRawToCounseling(rawResult);

      // 변환된 데이터 검증
      if (!isValidUpcomingCounseling(transformedResult)) {
        throw new AuthenticationError(
          'DATA_TRANSFORMATION_FAILED',
          '데이터 변환에 실패했습니다. 다시 시도해주세요.'
        );
      }

      return transformedResult;
    } catch (error) {
      // AuthenticationError는 그대로 재전파
      if (error instanceof AuthenticationError) {
        throw error;
      }

      // 요청 취소된 경우
      if (error instanceof Error && error.name === 'AbortError') {
        throw new AuthenticationError('ABORTED', '요청이 취소되었습니다.');
      }

      // Axios 에러 처리
      const axiosError = error as AxiosError<ApiResponse<null>>;

      // 네트워크 에러 세분화
      if (
        axiosError.code === 'NETWORK_ERROR' ||
        axiosError.code === 'ERR_NETWORK' ||
        axiosError.code === 'ECONNABORTED'
      ) {
        throw new AuthenticationError(
          'NETWORK_ERROR',
          '네트워크 연결을 확인해주세요.'
        );
      }

      // 타임아웃 에러
      if (axiosError.code === 'ECONNABORTED') {
        throw new AuthenticationError(
          'TIMEOUT_ERROR',
          '요청 시간이 초과되었습니다. 다시 시도해주세요.'
        );
      }

      // API 응답 에러 처리
      if (axiosError.response?.data) {
        const apiError = axiosError.response.data;
        switch (apiError.code) {
          case 'COUNSELING4001': // 상담예약이 없습니다
            return null; // 상담예약이 없는 경우는 null 반환
          case 'COMMON400': // 잘못된 요청입니다
            throw new AuthenticationError(
              'BAD_REQUEST',
              '잘못된 요청입니다. 페이지를 새로고침하고 다시 시도해주세요.'
            );
          case 'COMMON401': // 인증이 필요합니다
            throw new AuthenticationError(
              'UNAUTHORIZED',
              '로그인이 필요합니다. 다시 로그인해주세요.'
            );
          case 'COMMON403': // 금지된 요청입니다
            throw new AuthenticationError('FORBIDDEN', '접근 권한이 없습니다.');
          case 'COMMON500': // 서버 에러
            throw new AuthenticationError(
              'SERVER_ERROR',
              '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
            );
          default:
            throw new AuthenticationError(
              apiError.code || 'UPCOMING_COUNSELING_FETCH_FAILED',
              apiError.message ||
                '다가오는 상담 조회에 실패했습니다. 다시 시도해주세요.'
            );
        }
      }

      // 기타 모든 에러
      throw new AuthenticationError(
        'UPCOMING_COUNSELING_FETCH_FAILED',
        '다가오는 상담 조회에 실패했습니다. 다시 시도해주세요.'
      );
    }
  },

  // === 상담사 전용: 다가오는 상담 1건 (미구현 백엔드 대비) ===
  // 현재는 학생용 API를 재사용하고, 백엔드 준비되면 GET_COUNSELOR_UPCOMING으로 전환
  getCounselorUpcomingCounseling: async (
    signal?: AbortSignal
  ): Promise<UpcomingCounseling | null> => {
    // TODO: 백엔드 구현 후 endpoint를 COUNSELING_ENDPOINTS.GET_COUNSELOR_UPCOMING 로 교체하고
    // 반환 스키마(studentName 등)를 반영한 별도 transform 추가 예정.
    return counselingService.getUpcomingCounseling(signal);
  },

  // === 상담사 전용: 상담 내역 목록 (미구현 백엔드 대비) ===
  // 임시로 학생 내역 API 재사용. 추후 학생/상담사 구분되는 DTO 수신 시 분리.
  getCounselorCounselingHistory: async (
    signal?: AbortSignal
  ): Promise<CounselingHistory[]> => {
    return counselingService.getMyCounselingHistory(signal);
  },

  // 상담사: 내 상담 목록
  getMyCounselingListForCounselor: async (
    signal?: AbortSignal
  ): Promise<CounselingHistory[]> => {
    try {
      const response = await apiClient.get<
        ApiResponse<CounselorCounselingListItem[]>
      >(COUNSELING_ENDPOINTS.GET_COUNSELOR_HISTORY, {
        ...(signal && { signal }),
      });

      if (!response.data.isSuccess || !response.data.result) {
        return [];
      }

      return response.data.result.map(item => ({
        id: item.id,
        counselor: item.student,
        time: Array.isArray(item.time)
          ? convertLocalDateTimeArrayToISO(item.time)
          : (item.time as string),
        type: item.type,
        status: String(item.status),
      }));
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<null>>;
      if (axiosError.response?.status === 401) {
        throw new AuthenticationError('UNAUTHORIZED', '로그인이 필요합니다.');
      }
      return [];
    }
  },

  // 학생: 내 상담 목록
  getMyCounselingListForStudent: async (
    signal?: AbortSignal
  ): Promise<CounselingHistory[]> => {
    try {
      const response = await apiClient.get<
        ApiResponse<StudentCounselingListItem[]>
      >(COUNSELING_ENDPOINTS.GET_STUDENT_HISTORY, {
        ...(signal && { signal }),
      });

      if (!response.data.isSuccess || !response.data.result) {
        return [];
      }

      return response.data.result.map(item => ({
        id: item.id,
        counselor: item.name,
        time: Array.isArray(item.time)
          ? convertLocalDateTimeArrayToISO(item.time)
          : (item.time as string),
        type: item.type,
        status: String(item.status),
      }));
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<null>>;
      if (axiosError.response?.status === 401) {
        throw new AuthenticationError('UNAUTHORIZED', '로그인이 필요합니다.');
      }
      return [];
    }
  },

  // 상담 상세조회 (공통)
  getCounselingDetail: async (
    id: number | string,
    signal?: AbortSignal
  ): Promise<CounselingDetailDto> => {
    const response = await apiClient.get<ApiResponse<CounselingDetailDto>>(
      COUNSELING_ENDPOINTS.GET_DETAIL(id),
      {
        ...(signal && { signal }),
      }
    );
    if (!response.data.isSuccess || !response.data.result) {
      throw new AuthenticationError(
        response.data.code || 'COUNSELING_DETAIL_FETCH_FAILED',
        response.data.message || '상담 상세 조회에 실패했습니다.'
      );
    }
    return response.data.result;
  },
};
