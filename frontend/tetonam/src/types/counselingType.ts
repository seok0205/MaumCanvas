/**
 * 상담 유형 관련 타입 정의
 */

export interface CounselingTypeItem {
  readonly id: string;
  readonly name: string;
  readonly description: string;
}

export interface CounselingTypeCategory {
  readonly id: string;
  readonly title: string;
  readonly items: readonly CounselingTypeItem[];
}

// 상담 유형 데이터 상수
export const COUNSELING_TYPE_DATA: readonly CounselingTypeCategory[] = [
  {
    id: 'family',
    title: '가족/부모',
    items: [
      {
        id: 'family_relationship',
        name: '부모와의 관계',
        description: '부모와의 갈등, 소통 문제, 가족 내 불화 상담',
      },
    ],
  },
  {
    id: 'peer',
    title: '또래/친구',
    items: [
      {
        id: 'peer_conflict',
        name: '친구와의 다툼',
        description: '친구와의 갈등, 따돌림, 첫 연애 관련 상담',
      },
    ],
  },
  {
    id: 'school',
    title: '학교/교사',
    items: [
      {
        id: 'school_adaptation',
        name: '학교 적응',
        description: '교사와의 갈등, 학교폭력, 학교 적응 문제 상담',
      },
    ],
  },
  {
    id: 'academic',
    title: '학습/진로',
    items: [
      {
        id: 'academic_stress',
        name: '학업 스트레스',
        description: '성적 고민, 진로 문제, 시험 스트레스 상담',
      },
    ],
  },
  {
    id: 'emotional',
    title: '정서/불안/우울',
    items: [
      {
        id: 'emotional_support',
        name: '정서적 지원',
        description: '우울, 불안, 스트레스, 무기력, 분노조절 상담',
      },
    ],
  },
  {
    id: 'self_understanding',
    title: '자기이해/자존감',
    items: [
      {
        id: 'self_esteem',
        name: '자존감 향상',
        description: '자기표현, 정체성 찾기, 자존감 지하 문제 상담',
      },
    ],
  },
  {
    id: 'digital',
    title: '인터넷/SNS/게임',
    items: [
      {
        id: 'digital_addiction',
        name: '디지털 중독',
        description: '게임중독, 사이버 괴롭힘, SNS 스트레스 상담',
      },
    ],
  },
  {
    id: 'sexuality',
    title: '성/성정체성',
    items: [
      {
        id: 'sexual_identity',
        name: '성 정체성',
        description: '2차 성징, 성적 호기심, 성 정체성 고민 상담',
      },
    ],
  },
  {
    id: 'health',
    title: '건강/생활습관',
    items: [
      {
        id: 'lifestyle',
        name: '생활습관 개선',
        description: '과식, 불면, 신체 콤플렉스 관련 상담',
      },
    ],
  },
  {
    id: 'crisis',
    title: '위기/비행/자해/자살',
    items: [
      {
        id: 'crisis_intervention',
        name: '위기 개입',
        description: '위험 행동, 자해, 자살 충동, 가출 관련 긴급 상담',
      },
    ],
  },
  {
    id: 'other',
    title: '기타/비밀상담',
    items: [
      {
        id: 'confidential',
        name: '비밀 상담',
        description: '말하기 힘든 고민, 익명 상담 등 기타 상담',
      },
    ],
  },
] as const;

// 상담 유형 선택 관련 타입
export type CounselingTypeId =
  (typeof COUNSELING_TYPE_DATA)[number]['items'][number]['id'];

export interface CounselingTypeSelection {
  categoryId: string;
  itemId: string;
  name: string;
}

// 유틸리티 함수들
export const getCounselingTypeById = (
  id: string
): CounselingTypeItem | null => {
  for (const category of COUNSELING_TYPE_DATA) {
    const item = category.items.find(item => item.id === id);
    if (item) return item;
  }
  return null;
};

export const getCounselingTypeByName = (
  name: string
): CounselingTypeItem | null => {
  for (const category of COUNSELING_TYPE_DATA) {
    const item = category.items.find(item => item.name === name);
    if (item) return item;
  }
  return null;
};
