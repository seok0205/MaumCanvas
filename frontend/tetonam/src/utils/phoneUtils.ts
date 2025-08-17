import { FORM_CONSTANTS } from '@/constants/forms';

/**
 * 휴대폰 번호에서 하이픈을 제거하고 순수 숫자만 반환
 */
export const removeHyphens = (phone: string): string => {
  return phone.replace(/-/g, '');
};

/**
 * 휴대폰 번호에 하이픈을 자동으로 추가하여 포맷팅
 */
export const formatPhoneNumber = (phone: string): string => {
  // 하이픈 제거
  const cleaned = removeHyphens(phone);

  // 숫자가 아닌 문자 제거
  const numbersOnly = cleaned.replace(/\D/g, '');

  // 길이에 따라 하이픈 추가
  if (numbersOnly.length <= 3) {
    return numbersOnly;
  } else if (numbersOnly.length <= 7) {
    return `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3)}`;
  } else {
    return `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3, 7)}-${numbersOnly.slice(7, 11)}`;
  }
};

/**
 * 휴대폰 번호가 유효한지 검증
 */
export const validatePhoneNumber = (phone: string): boolean => {
  // 하이픈 제거 후 검증
  const cleaned = removeHyphens(phone);

  // 길이 검증
  if (
    cleaned.length < FORM_CONSTANTS.VALIDATION.PHONE_MIN_LENGTH ||
    cleaned.length > FORM_CONSTANTS.VALIDATION.PHONE_MAX_LENGTH
  ) {
    return false;
  }

  // 패턴 검증
  return FORM_CONSTANTS.VALIDATION.PHONE_NUMBER_ONLY_PATTERN.test(cleaned);
};

/**
 * 휴대폰 번호의 상세한 유효성 검사 결과 반환
 */
export const getPhoneValidationResult = (
  phone: string
): {
  isValid: boolean;
  error?: string;
} => {
  const cleaned = removeHyphens(phone);

  // 길이 검증
  if (cleaned.length < FORM_CONSTANTS.VALIDATION.PHONE_MIN_LENGTH) {
    return {
      isValid: false,
      error: '휴대폰 번호는 10자 이상 입력해주세요',
    };
  }

  if (cleaned.length > FORM_CONSTANTS.VALIDATION.PHONE_MAX_LENGTH) {
    return {
      isValid: false,
      error: '휴대폰 번호는 13자 이하여야 합니다',
    };
  }

  // 패턴 검증
  if (!FORM_CONSTANTS.VALIDATION.PHONE_NUMBER_ONLY_PATTERN.test(cleaned)) {
    return {
      isValid: false,
      error: '010, 011, 016, 017, 018, 019로 시작하는 번호를 입력해주세요',
    };
  }

  return { isValid: true };
};

/**
 * 입력 중인 휴대폰 번호를 실시간으로 포맷팅
 */
export const formatPhoneInput = (value: string): string => {
  // 숫자와 하이픈만 허용
  const cleaned = value.replace(/[^\d-]/g, '');

  // 연속된 하이픈 제거
  const noConsecutiveHyphens = cleaned.replace(/-+/g, '-');

  // 하이픈으로 시작하거나 끝나는 경우 제거
  const trimmed = noConsecutiveHyphens.replace(/^-|-$/g, '');

  return formatPhoneNumber(trimmed);
};
