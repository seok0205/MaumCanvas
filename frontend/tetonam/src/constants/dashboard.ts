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

export const MOCK_MENTAL_HEALTH = {
  stressLevel: { value: 60, label: '중간', color: 'bg-yellow-500' },
  depressionLevel: { value: 30, label: '낮음', color: 'bg-green-500' },
  anxietyLevel: { value: 50, label: '보통', color: 'bg-orange-500' },
} as const;

export const DAILY_TIPS = {
  COUNSELOR: [
    {
      title: '상담사를 위한 팁',
      content:
        '학생과의 첫 만남에서는 편안한 분위기 조성이 가장 중요합니다. 학생이 부담스럽지 않도록 가볍게 대화를 시작해보세요.',
    },
    {
      title: '건강한 우리 연결',
      content:
        '상담사도 마음의 건강을 챙겨야 합니다. 정기적인 휴식과 자기 돌봄을 통해 더 나은 상담을 제공할 수 있습니다.',
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
