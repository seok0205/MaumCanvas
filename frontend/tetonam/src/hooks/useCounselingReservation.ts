import { useMutation, useQuery } from '@tanstack/react-query';
import { addDays, format, isWeekend, startOfDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { COUNSELING_CONSTANTS } from '@/constants/counseling';
import { counselingService } from '@/services/counselingService';
import type { CounselingReservationRequest, CounselorInfo } from '@/types/api';
import { isValidCounselorInfo } from '@/types/api';
import type { CounselingTypeCategory } from '@/types/counselingType';

interface DateOption {
  date: Date;
  formattedDate: string;
  dayOfWeek: string;
  isSelected: boolean;
}

interface TimeOption {
  time: string;
  formattedTime: string;
  isSelected: boolean;
}

interface UseCounselingReservationReturn {
  // 상태
  selectedDate: Date | null;
  selectedTime: string;
  selectedCounselor: CounselorInfo | null;
  selectedCounselingType: CounselingTypeCategory | null;

  // 옵션들
  dateOptions: DateOption[];
  timeOptions: TimeOption[];

  // API 상태
  counselors: CounselorInfo[] | undefined;
  isLoadingCounselors: boolean;
  counselorsError: Error | null;

  // 핸들러들
  handleDateSelect: (date: Date) => void;
  handleTimeSelect: (time: string) => void;
  handleCounselorSelect: (counselor: CounselorInfo) => void;
  handleCounselingTypeSelect: (type: CounselingTypeCategory) => void;
  handleReservationConfirm: () => void;
  handleGoBack: () => void;

  // 뮤테이션 상태
  isReservationPending: boolean;
  refetchCounselors: () => void;
}

export const useCounselingReservation = (): UseCounselingReservationReturn => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedCounselor, setSelectedCounselor] =
    useState<CounselorInfo | null>(null);
  const [selectedCounselingType, setSelectedCounselingType] =
    useState<CounselingTypeCategory | null>(null);

  // 날짜 옵션 생성 (주말 제외, 오늘부터 7일)
  const dateOptions = useMemo((): DateOption[] => {
    const options: DateOption[] = [];
    const today = startOfDay(new Date());

    for (let i = 0; i < COUNSELING_CONSTANTS.MAX_DATE_RANGE; i++) {
      const date = addDays(today, i);
      if (!isWeekend(date)) {
        options.push({
          date,
          formattedDate: format(date, 'M월 d일', { locale: ko }),
          dayOfWeek: format(date, 'E', { locale: ko }),
          isSelected: selectedDate
            ? format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
            : false,
        });
      }
    }

    return options.slice(0, COUNSELING_CONSTANTS.MAX_DISPLAY_DATES);
  }, [selectedDate]);

  // 시간 옵션 생성 (9시부터 20시까지, 1시간 단위)
  const timeOptions = useMemo((): TimeOption[] => {
    const options: TimeOption[] = [];

    for (
      let hour = COUNSELING_CONSTANTS.START_HOUR;
      hour <= COUNSELING_CONSTANTS.END_HOUR;
      hour += COUNSELING_CONSTANTS.HOUR_INTERVAL
    ) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      options.push({
        time,
        formattedTime: time,
        isSelected: selectedTime === time,
      });
    }

    return options;
  }, [selectedTime]);

  // 상담사 조회 쿼리
  const {
    data: counselors,
    isLoading: isLoadingCounselors,
    error: counselorsError,
    refetch: refetchCounselors,
  } = useQuery({
    queryKey: ['counselors', selectedDate, selectedTime],
    queryFn: () => {
      if (!selectedDate || !selectedTime) {
        return Promise.resolve([]);
      }
      // Spring Boot LocalDateTime 기본 파싱 형식 (ISO Local DateTime)
      const dateTime =
        format(selectedDate, 'yyyy-MM-dd') + 'T' + selectedTime + ':00';
      return counselingService.getAvailableCounselors(dateTime);
    },
    enabled: !!(selectedDate && selectedTime),
    staleTime: COUNSELING_CONSTANTS.STALE_TIME,
    gcTime: COUNSELING_CONSTANTS.GC_TIME,
  });

  // 상담 예약 뮤테이션 - TanStack Query Best Practices 적용
  const reservationMutation = useMutation({
    mutationKey: ['counseling', 'reserve'],
    mutationFn: async (data: CounselingReservationRequest) => {
      // 추가 검증 로직
      if (
        !data.counselorId ||
        typeof data.counselorId !== 'number' ||
        data.counselorId <= 0
      ) {
        throw new Error('상담사 ID가 유효하지 않습니다.');
      }
      if (!data.time || !data.types) {
        throw new Error('필수 정보가 누락되었습니다.');
      }

      const result = await counselingService.reserveCounseling(data);

      return result;
    },
    onMutate: async variables => {
      // 낙관적 업데이트를 위한 이전 상태 저장
      return { variables };
    },
    onSuccess: () => {
      toast.success('상담이 성공적으로 예약되었습니다.');
      navigate('/dashboard');
    },
    onError: (error: Error) => {
      toast.error(
        error.message || '상담 예약에 실패했습니다. 다시 시도해주세요.'
      );
    },
    // 중복 요청 방지를 위한 설정
    retry: false, // 자동 재시도 비활성화
  });

  // 날짜 선택 핸들러
  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
    setSelectedTime('');
    setSelectedCounselor(null);
  }, []);

  // 시간 선택 핸들러
  const handleTimeSelect = useCallback((time: string) => {
    setSelectedTime(time);
    setSelectedCounselor(null);
  }, []);

  // 상담사 선택 핸들러
  const handleCounselorSelect = useCallback((counselor: CounselorInfo) => {
    // 상담사 데이터 검증 - 타입 가드 함수 사용
    if (!isValidCounselorInfo(counselor)) {
      toast.error('상담사 정보가 올바르지 않습니다.');
      return;
    }

    setSelectedCounselor(counselor);
  }, []);

  // 상담유형 선택 핸들러
  const handleCounselingTypeSelect = useCallback(
    (type: CounselingTypeCategory) => {
      setSelectedCounselingType(type);
    },
    []
  );

  // 예약 확정 핸들러
  const handleReservationConfirm = useCallback(() => {
    // 1차 검증: 필수 선택 항목 확인
    if (
      !selectedDate ||
      !selectedTime ||
      !selectedCounselor ||
      !selectedCounselingType
    ) {
      toast.error('모든 항목을 선택해주세요.');
      return;
    }

    // 2차 검증: counselorId 상세 검증
    if (
      !selectedCounselor.id ||
      typeof selectedCounselor.id !== 'number' ||
      selectedCounselor.id <= 0
    ) {
      toast.error('선택된 상담사 정보가 올바르지 않습니다. 다시 선택해주세요.');
      return;
    }

    // 중요: 그림 그리기 완료 여부 확인 안내
    const hasDrawing = confirm(
      '상담 예약을 위해서는 그림 그리기를 먼저 완료해야 합니다.\n' +
        '그림 그리기를 완료하셨나요?\n\n' +
        '완료하지 않으셨다면 "취소"를 눌러 그림 그리기를 먼저 진행해주세요.'
    );

    if (!hasDrawing) {
      toast.info('그림 그리기를 먼저 완료해주세요.');
      // TODO: 그림 그리기 페이지로 리다이렉트
      // navigate('/drawing');
      return;
    }

    // Spring Boot JSON 역직렬화가 기대하는 ISO 8601 형식
    const dateTime =
      format(selectedDate, 'yyyy-MM-dd') + 'T' + selectedTime + ':00';
    const reservationData: CounselingReservationRequest = {
      time: dateTime,
      types: selectedCounselingType.title,
      counselorId: selectedCounselor.id, // 백엔드 DTO와 일치하도록 수정
    };

    reservationMutation.mutate(reservationData);
  }, [
    selectedDate,
    selectedTime,
    selectedCounselor,
    selectedCounselingType,
    reservationMutation,
  ]);

  // 뒤로가기 핸들러
  const handleGoBack = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  return {
    // 상태
    selectedDate,
    selectedTime,
    selectedCounselor,
    selectedCounselingType,

    // 옵션들
    dateOptions,
    timeOptions,

    // API 상태
    counselors,
    isLoadingCounselors,
    counselorsError,

    // 핸들러들
    handleDateSelect,
    handleTimeSelect,
    handleCounselorSelect,
    handleCounselingTypeSelect,
    handleReservationConfirm,
    handleGoBack,

    // 뮤테이션 상태
    isReservationPending: reservationMutation.isPending,
    refetchCounselors,
  };
};
