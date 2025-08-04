import { DiagnosisCategory } from '@/types/diagnosis';

export const DIAGNOSIS_CATEGORIES: DiagnosisCategory[] = [
  {
    id: 'ptsd',
    title: '외상 후 스트레스 증상',
    description: '충격적인 사건 이후 겪을 수 있는 스트레스 반응을 확인합니다.',
    icon: '⚠️',
    color: 'bg-red-50 border-red-200 text-red-700',
    path: '/diagnosis/ptsd',
  },
  {
    id: 'depression',
    title: '우울증상',
    description:
      '최근 기분 상태와 우울감을 점검하고 이해하는 데 도움을 줍니다.',
    icon: '😊',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    path: '/diagnosis/depression',
  },
  {
    id: 'anxiety',
    title: '불안증상',
    description: '일상생활에서 느끼는 불안의 정도와 유형을 파악합니다.',
    icon: '✅',
    color: 'bg-green-50 border-green-200 text-green-700',
    path: '/diagnosis/anxiety',
  },
  {
    id: 'suicide-risk',
    title: '자살위험성',
    description:
      '자살 생각이나 계획의 위험성을 평가하고 도움을 요청할 수 있도록 합니다.',
    icon: '💝',
    color: 'bg-orange-50 border-orange-200 text-orange-700',
    path: '/diagnosis/suicide-risk',
  },
  {
    id: 'drawing',
    title: '그림 진단',
    description:
      '미술치료 기법을 활용하여 그림을 통해 내면의 감정과 심리상태를 탐색합니다.',
    icon: '🎨',
    color: 'bg-purple-50 border-purple-200 text-purple-700',
    path: '/diagnosis/drawing',
  },
];

export const DISCLAIMER_TEXT = `본 서비스에서 제공하는 자가진단은 일반적인 건강 정보 및 참고 자료이며, 전문적인 의료 조언, 진단, 또는 치료를 대체할 수 없습니다. 자신의 건강 문제나 증상에 대해서는 반드시 의사, 약사 등 자격을 갖춘 의료 전문가와 상담하시기 바랍니다. 본 서비스의 결과를 바탕으로 의학적 치료를 시작, 변경 또는 중단해서는 안 됩니다.`;

export const DIAGNOSIS_PAGE_TITLE = '내 마음 진단';
