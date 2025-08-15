export const DASHBOARD_CONSTANTS = {
  WELCOME_MESSAGES: {
    COUNSELOR: '안녕하세요, {name} 상담사님! 👩‍⚕️',
    USER: '안녕하세요, {name}님! 👋',
  },
  SUBTITLES: {
    COUNSELOR: '오늘도 따뜻한 마음으로 학생들과 함께해주세요.',
    USER: '오늘도 따뜻한 마음으로 함께하는 상담을 시작해보세요.',
  },
  QUICK_ACTIONS: {
    COUNSELOR: [
      {
        title: '내 일정 관리하기',
        description: '오늘의 상담 일정을 확인하고 관리하세요',
        actionText: '일정 보기',
        variant: 'default' as const,
      },
      {
        title: '학생 상담 시작하기',
        description: '새로운 학생과의 상담을 시작하세요',
        actionText: '상담 시작',
        variant: 'outline' as const,
      },
      {
        title: '커뮤니티',
        description: '다른 상담사들과 경험을 공유하세요',
        actionText: '참여하기',
        variant: 'outline' as const,
      },
    ],
    USER: [
      {
        title: '상담 예약하기',
        description: '전문 상담사와 1:1 상담을 예약하세요',
        actionText: '예약하기',
        variant: 'default' as const,
      },
      {
        title: '내 마음 진단하기',
        description: '간단한 질문으로 현재 상태를 확인하세요',
        actionText: '시작하기',
        variant: 'outline' as const,
      },
      {
        title: '커뮤니티',
        description: '비슷한 고민을 가진 친구들과 소통하세요',
        actionText: '참여하기',
        variant: 'outline' as const,
      },
    ],
  },
} as const;

export const MOCK_APPOINTMENTS = {
  COUNSELOR: [
    {
      id: '1',
      date: '2024-01-15',
      time: '14:00',
      studentName: '김학생',
      grade: '고등학교 2학년',
      topic: '학업 스트레스 상담',
    },
    {
      id: '2',
      date: '2024-01-15',
      time: '16:00',
      studentName: '이학생',
      grade: '고등학교 1학년',
      topic: '진로 고민 상담',
    },
  ],
  USER: [
    {
      id: '1',
      date: '2024-01-15',
      time: '14:00',
      counselorName: '김상담 상담사',
    },
    {
      id: '2',
      date: '2024-01-18',
      time: '16:00',
      counselorName: '이상담 상담사',
    },
  ],
} as const;

export const MOCK_STATS = {
  COUNSELOR: {
    totalCounselings: 124,
    weeklyCounselings: 8,
    satisfactionRate: 92,
  },
} as const;

export const DAILY_TIPS = {
  COUNSELOR: [
    {
      title: '효과적인 경청 기법',
      content:
        '상담에서 가장 중요한 것은 경청입니다. 학생의 말을 끝까지 들어주고, 감정을 공감하며 반영해주세요. 성급한 조언보다는 깊이 있는 이해가 우선입니다.',
    },
    {
      title: '안전한 상담 환경 조성',
      content:
        '학생이 편안하게 자신의 마음을 열 수 있도록 안전하고 비판받지 않는 환경을 만들어주세요. 비밀보장에 대한 확신을 주는 것이 중요합니다.',
    },
    {
      title: '문화적 민감성 유지',
      content:
        '각 학생의 문화적 배경과 개인적 가치관을 존중해주세요. 다양성을 인정하고 편견 없는 상담을 제공하는 것이 전문가의 자세입니다.',
    },
    {
      title: '상담사 자기관리',
      content:
        '상담사의 정신건강이 곧 상담의 질을 결정합니다. 정기적인 슈퍼비전을 받고, 개인적인 스트레스 관리와 자기 돌봄을 소홀히 하지 마세요.',
    },
    {
      title: '지속적인 전문성 개발',
      content:
        '상담 이론과 기법은 계속 발전하고 있습니다. 정기적인 교육 참여와 최신 연구 동향을 파악하여 전문성을 지속적으로 향상시켜주세요.',
    },
  ],
  USER: [
    {
      title: '스트레스 관리법',
      content:
        '깊은 호흡을 통해 마음을 진정시켜보세요. 4초 들이마시고, 4초 참았다가, 4초에 걸쳐 내쉬는 호흡법을 실천해보세요.',
    },
    {
      title: '긍정적 사고',
      content:
        '매일 작은 성취에도 스스로를 격려해주세요. 작은 칭찬이 큰 변화를 만들어냅니다.',
    },
  ],
} as const;

export const QUESTIONNAIRE_CATEGORIES = {
  스트레스: '스트레스',
  우울: '우울',
  불안: '불안',
  자살: '자살',
} as const;
