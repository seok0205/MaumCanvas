import { Shield, Users, Heart, CheckCircle, BookOpen, AlertTriangle, Scale } from 'lucide-react';
import type { CommunityGuideline } from '@/types/communityGuidelines';

export const COMMUNITY_GUIDELINES: CommunityGuideline[] = [
  {
    id: 'confidentiality',
    title: '비밀보장',
    description: '내담자의 개인정보와 상담 내용을 철저히 보호합니다',
    icon: Shield,
    tips: [
      '상담 기록을 안전한 장소에 보관하기',
      '제3자와 상담 내용 공유 금지',
      '개인정보 익명화 처리 원칙 준수',
    ],
  },
  {
    id: 'professional-boundaries',
    title: '전문적 경계',
    description: '내담자와 적절한 전문적 관계를 유지합니다',
    icon: Users,
    tips: [
      '개인적 관계와 전문적 관계 구분',
      '이중 관계 상황 회피하기',
      '적절한 물리적, 감정적 거리 유지',
    ],
  },
  {
    id: 'do-no-harm',
    title: '무해의 원칙',
    description: '상담 과정에서 내담자에게 해를 끼치지 않습니다',
    icon: Heart,
    tips: [
      '내담자의 안전을 최우선으로 고려',
      '자신의 전문 역량 범위 인식',
      '필요시 적절한 전문가에게 의뢰',
    ],
  },
  {
    id: 'respect-autonomy',
    title: '자율성 존중',
    description: '내담자의 자기결정권과 선택을 존중합니다',
    icon: CheckCircle,
    tips: [
      '내담자의 의견과 선택 존중',
      '강요나 조작 없는 상담 진행',
      '충분한 정보 제공 후 결정 유도',
    ],
  },
  {
    id: 'professional-development',
    title: '전문성 개발',
    description: '지속적인 학습과 성장을 통해 전문성을 향상시킵니다',
    icon: BookOpen,
    tips: [
      '정기적인 전문 교육 이수',
      '슈퍼비전 및 동료 상담 참여',
      '최신 상담 기법과 이론 학습',
    ],
  },
  {
    id: 'dual-relationship-awareness',
    title: '이중관계 주의',
    description: '개인적 이익이나 이중관계로 인한 갈등을 방지합니다',
    icon: AlertTriangle,
    tips: [
      '개인적 이익 추구 금지',
      '친인척 상담 회피',
      '비즈니스 관계 형성 금지',
    ],
  },
  {
    id: 'legal-ethical-compliance',
    title: '법적・윤리적 준수',
    description: '관련 법규와 윤리 기준을 철저히 준수합니다',
    icon: Scale,
    tips: [
      '상담 관련 법령 숙지',
      '윤리위원회 결정 준수',
      '신고 의무 사항 이행',
    ],
  },
];

export const getGuidelineById = (id: string): CommunityGuideline | undefined => {
  return COMMUNITY_GUIDELINES.find(guideline => guideline.id === id);
};
