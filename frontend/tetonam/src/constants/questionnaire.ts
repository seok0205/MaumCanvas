import { QuestionnaireCategory } from '@/types/questionnaire';

export const QUESTIONNAIRE_CATEGORIES: QuestionnaireCategory[] = [
  {
    id: 'ptsd',
    title: '외상 후 스트레스 증상',
    description:
      '살면서 두려웠던 경험, 끔찍했던 경험, 힘들었던 경험, 그 어떤 것이라도 있다면, 그것 때문에 지난 한 달 동안 다음과 같은 문제들로 인해 얼마나 괴로움을 느꼈습니까?',
    maxScore: 5,
    questions: [
      {
        id: 1,
        text: '그 경험에 관한 악몽을 꾸거나, 생각하고 싶지 않은데도 그 경험이 떠오른 적이 있었다.',
        options: [
          { text: '아니오', score: 0 },
          { text: '예', score: 1 },
        ],
      },
      {
        id: 2,
        text: '그 경험에 대해 생각하지 않으려고 애쓰거나, 그 경험을 떠오르게 하는 상황을 피하기 위해 특별히 노력하였다.',
        options: [
          { text: '아니오', score: 0 },
          { text: '예', score: 1 },
        ],
      },
      {
        id: 3,
        text: '늘 주변을 살피고 경계하거나, 쉽게 놀라게 되었다.',
        options: [
          { text: '아니오', score: 0 },
          { text: '예', score: 1 },
        ],
      },
      {
        id: 4,
        text: '다른사람, 일상활동, 또는 주변 상황에 대해 가졌던 느낌이 없어지거나, 그것에 대해 멀어진 느낌이 들었다.',
        options: [
          { text: '아니오', score: 0 },
          { text: '예', score: 1 },
        ],
      },
      {
        id: 5,
        text: '그 사건이나 그 사건으로 인해 생긴 문제에 대해 죄책감을 느끼거나, 자기자신이나 다른 사람에 대한 원망을 멈출 수가 없었다.',
        options: [
          { text: '아니오', score: 0 },
          { text: '예', score: 1 },
        ],
      },
    ],
    resultLevels: [
      {
        minScore: 0,
        maxScore: 2,
        level: '정상',
        description:
          '일상생활 적응에 지장을 초래할만한 외상 사건 경험이나 이와 관련된 인지적, 정서적, 행동문제를 거의 보고하지 않았습니다.',
      },
      {
        minScore: 3,
        maxScore: 5,
        level: '주의 필요',
        description:
          '외상 사건과 관련된 반응으로 불편감을 호소하고 있습니다. 평소보다 일상생활에 적응하는데 어려움을 느끼신다면 추가적인 평가나 정신건강 전문가의 도움을 받아보시기를 권해 드립니다.',
        recommendation: '정신건강 전문가와 상담을 고려해보세요.',
      },
    ],
  },
  {
    id: 'depression',
    title: '우울증상',
    description:
      '지난 2주일 동안 당신은 다음의 문제들로 인해서 얼마나 자주 방해를 받았습니까?',
    maxScore: 27,
    questions: [
      {
        id: 1,
        text: '일 또는 여가 활동을 하는데 흥미나 즐거움을 느끼지 못함',
        options: [
          { text: '전혀', score: 0 },
          { text: '며칠 동안', score: 1 },
          { text: '7일 이상', score: 2 },
          { text: '거의 매일', score: 3 },
        ],
      },
      {
        id: 2,
        text: '기분이 가라앉거나, 우울하거나, 희망이 없음',
        options: [
          { text: '전혀', score: 0 },
          { text: '며칠 동안', score: 1 },
          { text: '7일 이상', score: 2 },
          { text: '거의 매일', score: 3 },
        ],
      },
      {
        id: 3,
        text: '잠이 들거나 계속 잠을 자는 것이 어려움, 또는 잠을 너무 많이 잠',
        options: [
          { text: '전혀', score: 0 },
          { text: '며칠 동안', score: 1 },
          { text: '7일 이상', score: 2 },
          { text: '거의 매일', score: 3 },
        ],
      },
      {
        id: 4,
        text: '피곤하다고 느끼거나 기운이 거의 없음',
        options: [
          { text: '전혀', score: 0 },
          { text: '며칠 동안', score: 1 },
          { text: '7일 이상', score: 2 },
          { text: '거의 매일', score: 3 },
        ],
      },
      {
        id: 5,
        text: '입맛이 없거나 과식을 함',
        options: [
          { text: '전혀', score: 0 },
          { text: '며칠 동안', score: 1 },
          { text: '7일 이상', score: 2 },
          { text: '거의 매일', score: 3 },
        ],
      },
      {
        id: 6,
        text: '자신을 부정적으로 봄 – 혹은 자신이 실패자라고 느끼거나 자신 또는 가족을 실망시킴',
        options: [
          { text: '전혀', score: 0 },
          { text: '며칠 동안', score: 1 },
          { text: '7일 이상', score: 2 },
          { text: '거의 매일', score: 3 },
        ],
      },
      {
        id: 7,
        text: '신문을 읽거나 텔레비전 보는 것과 같은 일에 집중하는 것이 어려움',
        options: [
          { text: '전혀', score: 0 },
          { text: '며칠 동안', score: 1 },
          { text: '7일 이상', score: 2 },
          { text: '거의 매일', score: 3 },
        ],
      },
      {
        id: 8,
        text: '다른 사람들이 주목할 정도로 너무 느리게 움직이거나 말을 함 또는 반대로 평상시보다 많이 움직여서, 너무 안절부절 못하거나 들떠 있음',
        options: [
          { text: '전혀', score: 0 },
          { text: '며칠 동안', score: 1 },
          { text: '7일 이상', score: 2 },
          { text: '거의 매일', score: 3 },
        ],
      },
      {
        id: 9,
        text: '자신이 죽는 것이 더 낫다고 생각하거나 어떤 식으로든 자신을 해칠 것이라고 생각함',
        options: [
          { text: '전혀', score: 0 },
          { text: '며칠 동안', score: 1 },
          { text: '7일 이상', score: 2 },
          { text: '거의 매일', score: 3 },
        ],
      },
    ],
    resultLevels: [
      {
        minScore: 0,
        maxScore: 4,
        level: '정상',
        description:
          '적응상의 지장을 초래할만한 우울 관련 증상을 거의 보고하지 않았습니다.',
      },
      {
        minScore: 5,
        maxScore: 9,
        level: '경미',
        description:
          '경미한 수준의 우울감이 있으나 일상생활에 지장을 줄 정도는 아닙니다.',
        recommendation: '정신건강 전문가와 상담을 고려해보세요.',
      },
      {
        minScore: 10,
        maxScore: 14,
        level: '중간',
        description:
          '중간수준의 우울감을 비교적 자주 경험하는 것으로 보고하였습니다. 직업적, 사회적 적응에 일부 영향을 미칠 수 있어 주의 깊은 관찰과 관심이 필요합니다.',
        recommendation: '정신건강 전문가의 도움을 받는 것을 권장합니다.',
      },
      {
        minScore: 15,
        maxScore: 19,
        level: '약간 심함',
        description:
          '약간 심한 수준의 우울감을 자주 경험하는 것으로 보고하였습니다. 직업적, 사회적 적응에 일부 영향을 미칠 경우, 정신건강 전문가의 도움을 받아 보시기를 권해 드립니다.',
        recommendation: '정신건강 전문가의 도움을 받으세요.',
      },
      {
        minScore: 20,
        maxScore: 27,
        level: '심함',
        description:
          '광범위한 우울 증상을 매우 자주, 심한 수준에서 경험하는 것으로 보고하였습니다. 일상생활의 다양한 영역에서 어려움이 초래될 경우, 추가적인 평가나 정신건강 전문가의 도움을 받아보시기를 권해 드립니다.',
        recommendation: '즉시 정신건강 전문가의 도움을 받으세요.',
      },
    ],
  },
  {
    id: 'anxiety',
    title: '불안증상',
    description:
      '지난 2주일 동안 당신은 다음의 문제들로 인해서 얼마나 자주 방해를 받았습니까?',
    maxScore: 21,
    questions: [
      {
        id: 1,
        text: '초조하거나 불안하거나 조마조마하게 느낀다.',
        options: [
          { text: '전혀 그렇지 않다', score: 0 },
          { text: '가끔 그렇다', score: 1 },
          { text: '자주 그렇다', score: 2 },
          { text: '매우 자주 그렇다', score: 3 },
        ],
      },
      {
        id: 2,
        text: '걱정하는 것을 멈추거나 조절할 수가 없다.',
        options: [
          { text: '전혀 그렇지 않다', score: 0 },
          { text: '가끔 그렇다', score: 1 },
          { text: '자주 그렇다', score: 2 },
          { text: '매우 자주 그렇다', score: 3 },
        ],
      },
      {
        id: 3,
        text: '여러 가지 것들에 대해 걱정을 너무 많이 한다.',
        options: [
          { text: '전혀 그렇지 않다', score: 0 },
          { text: '가끔 그렇다', score: 1 },
          { text: '자주 그렇다', score: 2 },
          { text: '매우 자주 그렇다', score: 3 },
        ],
      },
      {
        id: 4,
        text: '편하게 있기가 어렵다.',
        options: [
          { text: '전혀 그렇지 않다', score: 0 },
          { text: '가끔 그렇다', score: 1 },
          { text: '자주 그렇다', score: 2 },
          { text: '매우 자주 그렇다', score: 3 },
        ],
      },
      {
        id: 5,
        text: '쉽게 짜증이 나거나 쉽게 성을 내게 된다.',
        options: [
          { text: '전혀 그렇지 않다', score: 0 },
          { text: '가끔 그렇다', score: 1 },
          { text: '자주 그렇다', score: 2 },
          { text: '매우 자주 그렇다', score: 3 },
        ],
      },
      {
        id: 6,
        text: '너무 안절부절못해서 가만히 있기가 힘들다.',
        options: [
          { text: '전혀 그렇지 않다', score: 0 },
          { text: '가끔 그렇다', score: 1 },
          { text: '자주 그렇다', score: 2 },
          { text: '매우 자주 그렇다', score: 3 },
        ],
      },
      {
        id: 7,
        text: '마치 끔찍한 일이 생길 것처럼 두렵게 느껴진다.',
        options: [
          { text: '전혀 그렇지 않다', score: 0 },
          { text: '가끔 그렇다', score: 1 },
          { text: '자주 그렇다', score: 2 },
          { text: '매우 자주 그렇다', score: 3 },
        ],
      },
    ],
    resultLevels: [
      {
        minScore: 0,
        maxScore: 4,
        level: '정상',
        description:
          '주의가 필요할 정도의 과도한 걱정이나 불안을 보고하지 않았습니다.',
      },
      {
        minScore: 5,
        maxScore: 9,
        level: '경미',
        description:
          '다소 경미한 수준의 걱정과 불안을 보고하였습니다. 주의깊은 관찰과 관심이 필요합니다.',
        recommendation: '정신건강 전문가와 상담을 고려해보세요.',
      },
      {
        minScore: 10,
        maxScore: 14,
        level: '중간',
        description:
          '주의가 필요한 수준의 과도한 걱정과 불안을 보고하였습니다. 추가적인 평가나 정신건강 전문가의 도움을 받아보시기를 권해 드립니다.',
        recommendation: '정신건강 전문가의 도움을 받는 것을 권장합니다.',
      },
      {
        minScore: 15,
        maxScore: 21,
        level: '심각',
        description:
          '일상생활에 지장을 초래할 정도의 과도하고 심한 걱정과 불안을 보고하였습니다. 추가적인 평가나 정신건강 전문가의 전문가의 도움을 받아 보시기를 권해 드립니다.',
        recommendation: '즉시 정신건강 전문가의 도움을 받으세요.',
      },
    ],
  },
  {
    id: 'suicide-risk',
    title: '자살위험성',
    description: '당신 자신을 정말 해치겠다는 생각을 했던 적이 있습니까?',
    maxScore: 0, // 자살위험성은 조건부 평가이므로 maxScore 불사용
    questions: [
      {
        id: 1,
        text: '이전에 당신이 위험에 빠뜨리는 행동을 한 적이 있습니까?',
        options: [
          { text: '있다', score: 1 },
          { text: '없다', score: 0 },
        ],
      },
      {
        id: 2,
        text: '당신자신을 정말 해칠 방법에 대해 지금도 생각을 하고 있습니까?',
        options: [
          { text: '있다', score: 1 },
          { text: '없다', score: 0 },
        ],
      },
      {
        id: 3,
        text: '생각하는 것과 생각을 행동에 옮기는 것은 큰 차이가 있습니다. 앞으로 한 달 내에는 어느 때라고 당신 자신을 해치거나 당신의 삶을 끝내겠다는 그 생각을 행동으로 옮길 것 같습니까?',
        options: [
          { text: '전혀 아니다', score: 0 },
          { text: '약간 그렇다', score: 1 },
          { text: '매우 그렇다', score: 2 },
        ],
      },
      {
        id: 4,
        text: '당신자신을 해치려는 당신의 행동을 멈추게 하거나 하지 못하게 막는 것이 있습니까?',
        options: [
          { text: '있다', score: 0 },
          { text: '없다', score: 1 },
        ],
      },
    ],
    resultLevels: [
      // 자살위험성은 조건부 평가이므로 resultLevels는 참조용으로만 사용
      // 실제 평가는 evaluateSuicideRisk 함수에서 수행
      {
        minScore: 0,
        maxScore: 0,
        level: '자살위험성 거의 없음',
        description:
          "'당신자신을 정말 해치겠다는 생각을 했던 적이 있습니까?' 라는 문항에 '없다'라고 응답한 경우 또는 아래 기준에 해당되지 않는 경우입니다.",
      },
      {
        minScore: 0,
        maxScore: 0,
        level: '자살위험성 낮음',
        description:
          "1,2번 문항중에 하나라도 '있다'라고 응답하고, 3,4번 문항에는 해당되지 않는 경우 자살 과거력이 있었거나 자살 계획에 대한 생각을 보고하였지만, 우발적인 자살 시도를 보일 가능성은 낮습니다.",
        recommendation: '정신건강 전문가와 상담을 고려해보세요.',
      },
      {
        minScore: 0,
        maxScore: 0,
        level: '자살위험성 높음',
        description:
          "3번 문항에 '약간 그렇다' 혹은 '매우 그렇다'라고 응답하거나 4번문항에 '없다'라고 응답한 경우 자살 가능성이 있다고 보고하였거나 자살 사고나 행동을 저지할 수 있는 보호요인이 없다고 보고하였습니다. 추가적인 평가나 정신건강 전문가의 도움을 받아보시기를 권해드립니다.",
        recommendation:
          '보건복지부는 2005년부터 전국 공통 자살예방 및 정신건강상담 전화 1577-0199를 운영하고 있습니다. 정신건강 또는 자살에 대한 고민이 있다면, 전문가의 도움을 받아보시기를 권해 드립니다.',
      },
    ],
  },
];

export const getQuestionnaireCategory = (
  id: string
): QuestionnaireCategory | undefined => {
  return QUESTIONNAIRE_CATEGORIES.find(category => category.id === id);
};

// 영어 ID를 한글 카테고리명으로 변환 (백엔드 Category enum 매핑)
export const getCategoryKoreanName = (englishId: string): string => {
  const categoryMap: Record<string, string> = {
    ptsd: '스트레스', // 외상 후 스트레스 -> 스트레스로 매핑
    depression: '우울',
    anxiety: '불안',
    'suicide-risk': '자살',
  };

  return categoryMap[englishId] || englishId;
};

export const getQuestionnaireResultLevel = (
  category: QuestionnaireCategory,
  score: number | string
) => {
  // 자살위험성은 조건부 평가이므로 별도 처리
  if (category.id === 'suicide-risk') {
    // score가 문자열(레벨명)인 경우, 해당 레벨 찾기
    if (typeof score === 'string') {
      return (
        category.resultLevels.find(level => level.level === score) ||
        category.resultLevels[0]
      );
    }
  }

  // 일반 설문은 기존 점수 기반 평가
  if (typeof score === 'number') {
    return (
      category.resultLevels.find(
        level => score >= level.minScore && score <= level.maxScore
      ) || category.resultLevels[0]
    );
  }

  // 예외 상황 처리
  return category.resultLevels[0];
};

// 자살위험성 조건부 평가 로직 (국립정신건강센터 기준)
export const evaluateSuicideRisk = (
  responses: Array<{ questionId: number; selectedScore: number }>
): {
  level: string;
  description: string;
  recommendation?: string;
} => {
  // 응답을 questionId별로 매핑
  const responseMap = responses.reduce(
    (map, response) => {
      map[response.questionId] = response.selectedScore;
      return map;
    },
    {} as Record<number, number>
  );

  // 각 문항별 응답 확인
  const q1Answer = responseMap[1]; // 1번: 위험 행동 경험 (1=있다, 0=없다)
  const q2Answer = responseMap[2]; // 2번: 구체적 자해 생각 (1=있다, 0=없다)
  const q3Answer = responseMap[3]; // 3번: 자해 방법 생각 (0=전혀아니다, 1=약간그렇다, 2=매우그렇다)
  const q4Answer = responseMap[4]; // 4번: 자해 행동 억제력 (0=있다, 1=없다)

  // 조건별 위험도 평가 (국립정신건강센터 기준)

  // 높은 위험: 3번 문항에 '약간 그렇다'(1점) 또는 '매우 그렇다'(2점) 응답
  //           또는 4번 문항에 '없다'(1점) 응답
  if (q3Answer === 1 || q3Answer === 2 || q4Answer === 1) {
    return {
      level: '자살위험성 높음',
      description:
        "3번 문항에 '약간 그렇다' 혹은 '매우 그렇다'라고 응답하거나 4번문항에 '없다'라고 응답한 경우 자살 가능성이 있다고 보고하였거나 자살 사고나 행동을 저지할 수 있는 보호요인이 없다고 보고하였습니다. 추가적인 평가나 정신건강 전문가의 도움을 받아보시기를 권해드립니다.",
      recommendation:
        '보건복지부는 2005년부터 전국 공통 자살예방 및 정신건강상담 전화 1577-0199를 운영하고 있습니다. 정신건강 또는 자살에 대한 고민이 있다면, 전문가의 도움을 받아보시기를 권해 드립니다.',
    };
  }

  // 낮은 위험: 1,2번 문항 중 하나라도 '있다'(1점) 응답하고,
  //            3번은 '전혀 아니다'(0점)이며 4번은 '있다'(0점)인 경우
  if ((q1Answer === 1 || q2Answer === 1) && q3Answer === 0 && q4Answer === 0) {
    return {
      level: '자살위험성 낮음',
      description:
        "1,2번 문항중에 하나라도 '있다'라고 응답하고, 3,4번 문항에는 해당되지 않는 경우 자살 과거력이 있었거나 자살 계획에 대한 생각을 보고하였지만, 우발적인 자살 시도를 보일 가능성은 낮습니다.",
      recommendation: '정신건강 전문가와 상담을 고려해보세요.',
    };
  }

  // 낮은 위험: 위의 조건들에 해당하지 않는 경우
  return {
    level: '자살위험성 거의 없음',
    description:
      "'당신자신을 정말 해치겠다는 생각을 했던 적이 있습니까?' 라는 문항에 '없다'라고 응답한 경우 또는 아래 기준에 해당되지 않는 경우입니다.",
  };
};

// 하드코딩된 메시지들을 상수로 분리
export const QUESTIONNAIRE_MESSAGES = {
  LOADING: '로딩 중...',
  ALL_QUESTIONS_REQUIRED: '모든 질문에 답변해주세요.',
  SUBMIT_BUTTON_TEXT: '결과 확인하기',
  REMAINING_QUESTIONS: (count: number) => `${count}개 질문 남음`,
  PROGRESS_LABEL: '진행률',
  SUBMIT_ERROR_TITLE: '제출 실패',
  SUBMIT_ERROR_MESSAGE: '설문 제출 중 오류가 발생했습니다. 다시 시도해주세요.',
  VALIDATION_ERROR_TITLE: '입력 확인',
} as const;
