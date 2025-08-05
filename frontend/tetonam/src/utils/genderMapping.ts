// 성별 enum 타입 정의
export type Gender = 'MALE' | 'FEMALE' | 'OTHERS';

// 성별 매핑 객체 - Record 유틸리티 타입 사용
export const GENDER_MAPPING: Record<Gender, string> = {
  MALE: '남자',
  FEMALE: '여자',
  OTHERS: '기타',
} as const;

/**
 * 성별 문자열을 한글로 변환하는 유틸리티 함수
 * @param gender - 성별 문자열 (API에서 받은 값)
 * @returns 한글 성별 문자열
 */
export const mapGenderToKorean = (gender: string): string => {
  const upperGender = gender.toUpperCase() as Gender;
  return GENDER_MAPPING[upperGender] || gender;
};
