import type { CommunityCategory } from '@/types/community';
import type { CounselingTypeId } from '@/types/counselingType';

/**
 * 상담 유형 ID를 커뮤니티 카테고리로 매핑하는 유틸리티
 */
export const mapCounselingTypeToCommunityCategory = (
  counselingTypeId: CounselingTypeId
): CommunityCategory => {
  const mappings: Record<CounselingTypeId, CommunityCategory> = {
    // 가족 관련
    family: 'FAMILY',

    // 친구/또래 관련
    peer: 'FRIENDSHIP',

    // 학업 관련
    school: 'STUDY',
    academic: 'STUDY',

    // 비밀/위기 상담
    crisis: 'SECRET',
    other: 'SECRET',

    // 일반적인 고민들
    emotional: 'GENERAL',
    self_understanding: 'GENERAL',
    digital: 'GENERAL',
    sexuality: 'GENERAL',
    health: 'GENERAL',
  };

  return mappings[counselingTypeId] || 'GENERAL';
};

/**
 * 커뮤니티 카테고리에 해당하는 상담 유형 ID들을 반환
 */
export const getCounselingTypesByCategory = (
  category: CommunityCategory
): CounselingTypeId[] => {
  const reverseMappings: Record<CommunityCategory, CounselingTypeId[]> = {
    FAMILY: ['family'],
    FRIENDSHIP: ['peer'],
    STUDY: ['school', 'academic'],
    SECRET: ['crisis', 'other'],
    GENERAL: [
      'emotional',
      'self_understanding',
      'digital',
      'sexuality',
      'health',
    ],
  };

  return reverseMappings[category] || [];
};
