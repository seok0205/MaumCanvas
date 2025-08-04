import { QuestionnaireCategory } from '@/types/questionnaire';

export const QUESTIONNAIRE_CATEGORIES: QuestionnaireCategory[] = [
  {
    id: 'ptsd',
    title: '외상 후 스트레스 증상',
    description: '충격적인 사건 이후 겪을 수 있는 스트레스 반응을 확인합니다.',
    maxScore: 80,
    questions: [
      {
        id: 1,
        text: '충격적인 사건에 대한 생각이나 기억이 갑자기 떠올라서 괴로웠습니다.',
        options: [
          { text: '전혀 그렇지 않다', score: 0 },
          { text: '조금 그렇다', score: 1 },
          { text: '상당히 그렇다', score: 2 },
          { text: '매우 그렇다', score: 3 },
        ],
      },
      {
        id: 2,
        text: '충격적인 사건에 대한 꿈을 꾸거나 악몽을 꾸었습니다.',
        options: [
          { text: '전혀 그렇지 않다', score: 0 },
          { text: '조금 그렇다', score: 1 },
          { text: '상당히 그렇다', score: 2 },
          { text: '매우 그렇다', score: 3 },
        ],
      },
      {
        id: 3,
        text: '충격적인 사건이 다시 일어나고 있는 것처럼 느꼈습니다.',
        options: [
          { text: '전혀 그렇지 않다', score: 0 },
          { text: '조금 그렇다', score: 1 },
          { text: '상당히 그렇다', score: 2 },
          { text: '매우 그렇다', score: 3 },
        ],
      },
      {
        id: 4,
        text: '충격적인 사건에 대해 생각하거나 그 사건을 떠올리면 신체적으로 긴장하거나 심장이 뛰거나 숨이 막히는 등의 반응을 보였습니다.',
        options: [
          { text: '전혀 그렇지 않다', score: 0 },
          { text: '조금 그렇다', score: 1 },
          { text: '상당히 그렇다', score: 2 },
          { text: '매우 그렇다', score: 3 },
        ],
      },
      {
        id: 5,
        text: '충격적인 사건에 대해 생각하거나 그 사건을 떠올리면 땀이 나거나 떨리는 등의 반응을 보였습니다.',
        options: [
          { text: '전혀 그렇지 않다', score: 0 },
          { text: '조금 그렇다', score: 1 },
          { text: '상당히 그렇다', score: 2 },
          { text: '매우 그렇다', score: 3 },
        ],
      },
      {
        id: 6,
        text: '충격적인 사건과 관련된 것들을 피하려고 노력했습니다.',
        options: [
          { text: '전혀 그렇지 않다', score: 0 },
          { text: '조금 그렇다', score: 1 },
          { text: '상당히 그렇다', score: 2 },
          { text: '매우 그렇다', score: 3 },
        ],
      },
      {
        id: 7,
        text: '충격적인 사건에 대한 기억이나 생각을 피하려고 노력했습니다.',
        options: [
          { text: '전혀 그렇지 않다', score: 0 },
          { text: '조금 그렇다', score: 1 },
          { text: '상당히 그렇다', score: 2 },
          { text: '매우 그렇다', score: 3 },
        ],
      },
      {
        id: 8,
        text: '충격적인 사건에 대한 중요한 부분들을 기억하지 못했습니다.',
        options: [
          { text: '전혀 그렇지 않다', score: 0 },
          { text: '조금 그렇다', score: 1 },
          { text: '상당히 그렇다', score: 2 },
          { text: '매우 그렇다', score: 3 },
        ],
      },
      {
        id: 9,
        text: '일상생활에 대한 관심이 줄어들었습니다.',
        options: [
          { text: '전혀 그렇지 않다', score: 0 },
          { text: '조금 그렇다', score: 1 },
          { text: '상당히 그렇다', score: 2 },
          { text: '매우 그렇다', score: 3 },
        ],
      },
      {
        id: 10,
        text: '다른 사람들과 멀어졌거나 소외감을 느꼈습니다.',
        options: [
          { text: '전혀 그렇지 않다', score: 0 },
          { text: '조금 그렇다', score: 1 },
          { text: '상당히 그렇다', score: 2 },
          { text: '매우 그렇다', score: 3 },
        ],
      },
      {
        id: 11,
        text: '감정이 둔해졌거나 감정을 느끼지 못했습니다.',
        options: [
          { text: '전혀 그렇지 않다', score: 0 },
          { text: '조금 그렇다', score: 1 },
          { text: '상당히 그렇다', score: 2 },
          { text: '매우 그렇다', score: 3 },
        ],
      },
      {
        id: 12,
        text: '미래가 없다고 느꼈습니다.',
        options: [
          { text: '전혀 그렇지 않다', score: 0 },
          { text: '조금 그렇다', score: 1 },
          { text: '상당히 그렇다', score: 2 },
          { text: '매우 그렇다', score: 3 },
        ],
      },
      {
        id: 13,
        text: '잠들기 어려웠습니다.',
        options: [
          { text: '전혀 그렇지 않다', score: 0 },
          { text: '조금 그렇다', score: 1 },
          { text: '상당히 그렇다', score: 2 },
          { text: '매우 그렇다', score: 3 },
        ],
      },
      {
        id: 14,
        text: '짜증이 나거나 화가 났습니다.',
        options: [
          { text: '전혀 그렇지 않다', score: 0 },
          { text: '조금 그렇다', score: 1 },
          { text: '상당히 그렇다', score: 2 },
          { text: '매우 그렇다', score: 3 },
        ],
      },
      {
        id: 15,
        text: '집중하기 어려웠습니다.',
        options: [
          { text: '전혀 그렇지 않다', score: 0 },
          { text: '조금 그렇다', score: 1 },
          { text: '상당히 그렇다', score: 2 },
          { text: '매우 그렇다', score: 3 },
        ],
      },
      {
        id: 16,
        text: '너무 긴장되어 있거나 항상 위험에 대비하고 있었습니다.',
        options: [
          { text: '전혀 그렇지 않다', score: 0 },
          { text: '조금 그렇다', score: 1 },
          { text: '상당히 그렇다', score: 2 },
          { text: '매우 그렇다', score: 3 },
        ],
      },
      {
        id: 17,
        text: '갑작스러운 소리나 움직임에 쉽게 놀랐습니다.',
        options: [
          { text: '전혀 그렇지 않다', score: 0 },
          { text: '조금 그렇다', score: 1 },
          { text: '상당히 그렇다', score: 2 },
          { text: '매우 그렇다', score: 3 },
        ],
      },
    ],
    resultLevels: [
      {
        minScore: 0,
        maxScore: 17,
        level: '정상',
        description: '외상 후 스트레스 증상이 거의 없습니다.',
      },
      {
        minScore: 18,
        maxScore: 25,
        level: '경미',
        description: '경미한 외상 후 스트레스 증상이 있습니다.',
        recommendation: '정신건강 전문가와 상담을 고려해보세요.',
      },
      {
        minScore: 26,
        maxScore: 33,
        level: '중간',
        description: '중간 수준의 외상 후 스트레스 증상이 있습니다.',
        recommendation: '정신건강 전문가의 도움을 받는 것을 권장합니다.',
      },
      {
        minScore: 34,
        maxScore: 80,
        level: '심각',
        description: '심각한 외상 후 스트레스 증상이 있습니다.',
        recommendation: '즉시 정신건강 전문가의 도움을 받으세요.',
      },
    ],
  },
  {
    id: 'depression',
    title: '우울증상',
    description:
      '최근 기분 상태와 우울감을 점검하고 이해하는 데 도움을 줍니다.',
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
          '중간 수준의 우울감을 비교적 자주 경험하는 것으로 보고하였습니다. 직업적, 사회적 적응에 일부 영향을 미칠 수 있어 주의 깊은 관찰과 관심이 필요합니다.',
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
    description: '일상생활에서 느끼는 불안의 정도와 유형을 파악합니다.',
    maxScore: 21,
    questions: [
      {
        id: 1,
        text: '긴장하거나 불안하거나 가장자리에 서 있는 느낌',
        options: [
          { text: '전혀 그렇지 않다', score: 0 },
          { text: '가끔 그렇다', score: 1 },
          { text: '자주 그렇다', score: 2 },
          { text: '매우 자주 그렇다', score: 3 },
        ],
      },
      {
        id: 2,
        text: '걱정하거나 걱정스러운 생각',
        options: [
          { text: '전혀 그렇지 않다', score: 0 },
          { text: '가끔 그렇다', score: 1 },
          { text: '자주 그렇다', score: 2 },
          { text: '매우 자주 그렇다', score: 3 },
        ],
      },
      {
        id: 3,
        text: '걱정하거나 두려워하는 느낌',
        options: [
          { text: '전혀 그렇지 않다', score: 0 },
          { text: '가끔 그렇다', score: 1 },
          { text: '자주 그렇다', score: 2 },
          { text: '매우 자주 그렇다', score: 3 },
        ],
      },
      {
        id: 4,
        text: '갑자기 공포를 느끼거나 무서워하는 느낌',
        options: [
          { text: '전혀 그렇지 않다', score: 0 },
          { text: '가끔 그렇다', score: 1 },
          { text: '자주 그렇다', score: 2 },
          { text: '매우 자주 그렇다', score: 3 },
        ],
      },
      {
        id: 5,
        text: '심장이 빠르게 뛰거나 숨이 막히는 느낌',
        options: [
          { text: '전혀 그렇지 않다', score: 0 },
          { text: '가끔 그렇다', score: 1 },
          { text: '자주 그렇다', score: 2 },
          { text: '매우 자주 그렇다', score: 3 },
        ],
      },
      {
        id: 6,
        text: '어떤 일이 일어날 것 같은 불안한 예감',
        options: [
          { text: '전혀 그렇지 않다', score: 0 },
          { text: '가끔 그렇다', score: 1 },
          { text: '자주 그렇다', score: 2 },
          { text: '매우 자주 그렇다', score: 3 },
        ],
      },
      {
        id: 7,
        text: '집중하기 어려운 느낌',
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
        description: '불안 증상이 거의 없습니다.',
      },
      {
        minScore: 5,
        maxScore: 9,
        level: '경미',
        description: '경미한 불안 증상이 있습니다.',
        recommendation: '정신건강 전문가와 상담을 고려해보세요.',
      },
      {
        minScore: 10,
        maxScore: 14,
        level: '중간',
        description: '중간 수준의 불안 증상이 있습니다.',
        recommendation: '정신건강 전문가의 도움을 받는 것을 권장합니다.',
      },
      {
        minScore: 15,
        maxScore: 21,
        level: '심각',
        description: '심각한 불안 증상이 있습니다.',
        recommendation: '즉시 정신건강 전문가의 도움을 받으세요.',
      },
    ],
  },
  {
    id: 'suicide-risk',
    title: '자살위험성',
    description:
      '자살 생각이나 계획의 위험성을 평가하고 도움을 요청할 수 있도록 합니다.',
    maxScore: 20,
    questions: [
      {
        id: 1,
        text: '자살에 대해 생각해본 적이 있다',
        options: [
          { text: '전혀 그렇지 않다', score: 0 },
          { text: '가끔 그렇다', score: 1 },
          { text: '자주 그렇다', score: 2 },
          { text: '매우 자주 그렇다', score: 3 },
        ],
      },
      {
        id: 2,
        text: '자살을 시도해본 적이 있다',
        options: [
          { text: '전혀 그렇지 않다', score: 0 },
          { text: '가끔 그렇다', score: 1 },
          { text: '자주 그렇다', score: 2 },
          { text: '매우 자주 그렇다', score: 3 },
        ],
      },
      {
        id: 3,
        text: '자살 계획을 세워본 적이 있다',
        options: [
          { text: '전혀 그렇지 않다', score: 0 },
          { text: '가끔 그렇다', score: 1 },
          { text: '자주 그렇다', score: 2 },
          { text: '매우 자주 그렇다', score: 3 },
        ],
      },
      {
        id: 4,
        text: '자살 도구를 준비해본 적이 있다',
        options: [
          { text: '전혀 그렇지 않다', score: 0 },
          { text: '가끔 그렇다', score: 1 },
          { text: '자주 그렇다', score: 2 },
          { text: '매우 자주 그렇다', score: 3 },
        ],
      },
      {
        id: 5,
        text: '자살 유서를 써본 적이 있다',
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
        level: '낮음',
        description: '자살 위험성이 낮습니다.',
      },
      {
        minScore: 5,
        maxScore: 9,
        level: '보통',
        description: '자살 위험성이 보통 수준입니다.',
        recommendation: '정신건강 전문가와 상담을 고려해보세요.',
      },
      {
        minScore: 10,
        maxScore: 14,
        level: '높음',
        description: '자살 위험성이 높습니다.',
        recommendation: '즉시 정신건강 전문가의 도움을 받으세요.',
      },
      {
        minScore: 15,
        maxScore: 20,
        level: '매우 높음',
        description: '자살 위험성이 매우 높습니다.',
        recommendation: '즉시 119나 자살예방상담전화 1393에 연락하세요.',
      },
    ],
  },
];

export const getQuestionnaireCategory = (
  id: string
): QuestionnaireCategory | undefined => {
  return QUESTIONNAIRE_CATEGORIES.find(category => category.id === id);
};

export const getQuestionnaireResultLevel = (
  category: QuestionnaireCategory,
  score: number
) => {
  return (
    category.resultLevels.find(
      level => score >= level.minScore && score <= level.maxScore
    ) || category.resultLevels[0]
  );
};
