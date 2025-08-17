export interface OnboardingSlideData {
  title: string;
  description: string;
  imageSrc: string;
}

export const ONBOARDING_DATA: OnboardingSlideData[] = [
  {
    title: '마음 캔버스에 오신 것을 환영합니다',
    description:
      '당신의 마음을 이야기하는 따뜻한 공간에서 전문 상담사와 함께 그림을 통해 소통해보세요.',
    imageSrc: '/lovable-uploads/18b63d63-cd3c-4dec-bda0-18168fea1dae.png',
  },
  {
    title: '전문 상담사와 1:1 상담',
    description:
      '자격을 갖춘 전문 상담사와 편안한 환경에서 개인 맞춤 상담을 받아보세요.',
    imageSrc: '/lovable-uploads/1d9b2558-b16d-4748-8a07-9162c5a13ed5.png',
  },
  {
    title: '함께 공유하는 커뮤니티',
    description: '비슷한 고민을 가진 친구들과 함께 이야기하며 서로 응원해요.',
    imageSrc: '/lovable-uploads/25fb28aa-f06f-429c-8b26-1a75ede0f397.png',
  },
];
