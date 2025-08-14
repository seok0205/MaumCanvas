import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { isValidDateString } from './counselingValidation';

/**
 * 날짜/시간 문자열을 한국어 형식으로 포맷팅
 * @param dateTimeString ISO 날짜/시간 문자열
 * @returns 포맷된 날짜와 시간 객체
 */
export const formatDateTime = (dateTimeString: string) => {
  try {
    // 유효성 검사 추가
    if (!isValidDateString(dateTimeString)) {
      throw new Error('Invalid date string');
    }

    const date = new Date(dateTimeString);

    // 유효한 날짜인지 확인
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }

    return {
      date: format(date, 'M월 d일 (E)', { locale: ko }),
      time: format(date, 'HH:mm'),
    };
  } catch {
    return {
      date: '날짜 정보 없음',
      time: '시간 정보 없음',
    };
  }
};

/**
 * 날짜/시간 문자열을 간단한 한국어 형식으로 포맷팅
 * @param dateTimeString ISO 날짜/시간 문자열
 * @returns 포맷된 날짜/시간 문자열 (예: "12월 25일 (월) 14:30")
 */
export const formatDateTimeSimple = (dateTimeString: string): string => {
  const { date, time } = formatDateTime(dateTimeString);
  return `${date} ${time}`;
};
