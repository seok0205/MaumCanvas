import { useMutation, useQuery } from '@tanstack/react-query';
import { addDays, format, isWeekend, startOfDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { COUNSELING_CONSTANTS } from '@/constants/counseling';
import { counselingService } from '@/services/counselingService';
import type { CounselingReservationRequest, CounselorInfo } from '@/types/api';
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
      const dateTime =
        format(selectedDate, 'yyyy-MM-dd') + 'T' + selectedTime + ':00';
      return counselingService.getAvailableCounselors(dateTime);
    },
    enabled: !!(selectedDate && selectedTime),
    staleTime: COUNSELING_CONSTANTS.STALE_TIME,
    gcTime: COUNSELING_CONSTANTS.GC_TIME,
  });

  // 상담 예약 뮤테이션
  const reservationMutation = useMutation({
    mutationFn: (data: CounselingReservationRequest) =>
      counselingService.reserveCounseling(data),
    onSuccess: () => {
      toast.success('상담이 성공적으로 예약되었습니다.');
      navigate('/dashboard');
    },
    onError: (error: Error) => {
      toast.error(
        error.message || '상담 예약에 실패했습니다. 다시 시도해주세요.'
      );
    },
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
    if (
      !selectedDate ||
      !selectedTime ||
      !selectedCounselor ||
      !selectedCounselingType
    ) {
      toast.error('모든 항목을 선택해주세요.');
      return;
    }

    const dateTime =
      format(selectedDate, 'yyyy-MM-dd') + 'T' + selectedTime + ':00';
    const reservationData: CounselingReservationRequest = {
      time: dateTime,
      types: selectedCounselingType.title,
      CounselorId: selectedCounselor.id,
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
