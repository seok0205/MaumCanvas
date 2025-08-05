// ✅ TailwindCSS 스타일 추상화
export const questionnaireStyles = {
  // 레이아웃 스타일
  container: 'max-w-4xl mx-auto',
  main: 'flex-1 overflow-auto p-6',

  // 카드 스타일
  card: {
    base: 'transition-all duration-200 border-border/50',
    answered: 'border-primary/50 bg-primary/5',
    unanswered: 'border-border/50',
  },

  // 진행률 스타일
  progress: {
    container: 'bg-card rounded-lg p-4 border border-border/50',
    bar: {
      container: 'w-full bg-muted rounded-full h-2 overflow-hidden',
      fill: 'h-full bg-primary transition-all duration-300 ease-in-out',
    },
    text: {
      label: 'text-sm font-medium text-muted-foreground',
      count: 'text-sm font-medium text-foreground',
    },
  },

  // 질문 번호 스타일
  questionNumber: {
    base: 'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
    answered: 'bg-primary text-primary-foreground',
    unanswered: 'bg-muted text-muted-foreground',
  },

  // 옵션 스타일
  option: {
    base: 'flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer hover:bg-muted/50',
    selected: 'border-primary bg-primary/10',
    unselected: 'border-border',
  },

  // 버튼 스타일
  submitButton: 'px-12 py-3 text-lg font-semibold',

  // 헤더 스타일
  header: {
    title: 'text-3xl font-bold text-foreground mb-4',
    description: 'text-muted-foreground text-lg mb-6',
  },
} as const;

// ✅ 접근성 속성들
export const accessibilityProps = {
  progressBar: {
    role: 'progressbar' as const,
    'aria-valuemin': 0,
    'aria-label': '설문 진행률',
  },
  questionCard: {
    role: 'group' as const,
  },
  radioGroup: {
    role: 'radiogroup' as const,
  },
} as const;
