/**
 * 청소년 친화적 컬러 팔레트 타입 정의
 * 청소년을 대상으로 하는 정신건강 플랫폼을 위함
 */

// 핵심 청소년 컬러 팔레트
export type YouthColor =
  | 'youth-orange'
  | 'youth-gold'
  | 'youth-yellow'
  | 'youth-cream'
  | 'youth-light-yellow'
  | 'youth-green'
  | 'youth-olive'
  | 'youth-soft-brown'
  | 'youth-light-pink'
  | 'youth-light-blue';

// 상태 기반 색상
export type YouthStateColor = 'success' | 'warning' | 'info' | 'pending';

// 컴포넌트 변형
export type YouthButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'info';

export type YouthCardVariant =
  | 'default'
  | 'selected'
  | 'counselor'
  | 'progress';

export type YouthBadgeVariant = 'success' | 'warning' | 'info' | 'pending';

// 그라디언트 타입
export type YouthGradient =
  | 'warm'
  | 'primary'
  | 'header'
  | 'subtle'
  | 'mint'
  | 'yellow'
  | 'blue';

// 그림자 타입
export type YouthShadow =
  | 'soft'
  | 'medium'
  | 'card'
  | 'hover'
  | 'youth'
  | 'youth-hover';

// 컴포넌트 속성 인터페이스
export interface YouthButtonProps {
  variant?: YouthButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export interface YouthCardProps {
  variant?: YouthCardVariant;
  children: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

export interface YouthBadgeProps {
  variant: YouthBadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export interface YouthInputProps {
  type?: 'text' | 'email' | 'password' | 'tel';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
}

// 페이지별 컴포넌트 타입
export interface AssessmentOptionProps {
  id: string;
  title: string;
  description?: string;
  selected?: boolean;
  onClick?: (id: string) => void;
}

export interface CounselorCardProps {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  available?: boolean;
  selected?: boolean;
  onClick?: (id: number) => void;
}

export interface TimeSlotProps {
  time: string;
  available: boolean;
  selected?: boolean;
  onClick?: (time: string) => void;
}

export interface ProgressBarProps {
  current: number;
  total: number;
  showPercentage?: boolean;
  className?: string;
}

// 컬러 팔레트 설정
export const YOUTH_COLORS = {
  primary: {
    orange: '#FFC107',
    gold: '#FFD700',
  },
  secondary: {
    yellow: '#FFEB99',
    cream: '#FFEFD5',
    lightYellow: '#FFFACD',
  },
  accent: {
    green: '#A3C9A8',
    olive: '#F0E68C',
    softBrown: '#DEB887',
  },
  functional: {
    lightPink: '#FFE4E1',
    lightBlue: '#E6F3FF',
  },
  text: {
    success: '#2d5a31',
    warning: '#8b2635',
    info: '#1e3a8a',
  },
} as const;

// CSS 커스텀 속성 이름
export const YOUTH_CSS_VARS = {
  colors: {
    orange: '--youth-orange',
    gold: '--youth-gold',
    yellow: '--youth-yellow',
    cream: '--youth-cream',
    lightYellow: '--youth-light-yellow',
    green: '--youth-green',
    olive: '--youth-olive',
    softBrown: '--youth-soft-brown',
    lightPink: '--youth-light-pink',
    lightBlue: '--youth-light-blue',
  },
  text: {
    success: '--text-success',
    warning: '--text-warning',
    info: '--text-info',
  },
  gradients: {
    warm: '--gradient-warm',
    primary: '--gradient-primary',
    header: '--gradient-header',
    subtle: '--gradient-subtle',
  },
  shadows: {
    youth: '--shadow-youth',
    youthHover: '--shadow-youth-hover',
  },
} as const;

// 청소년 색상 작업을 위한 유틸리티 함수
export const getYouthColorClass = (
  color: YouthColor,
  type: 'bg' | 'text' | 'border' = 'bg'
): string => {
  return `${type}-${color}`;
};

export const getStateColorClass = (state: YouthStateColor): string => {
  return `state-${state}`;
};

export const getBadgeClass = (variant: YouthBadgeVariant): string => {
  return `badge-youth-${variant}`;
};

export const getButtonClass = (variant: YouthButtonVariant): string => {
  return `btn-youth-${variant}`;
};

export const getCardClass = (variant: YouthCardVariant): string => {
  if (variant === 'default') return 'card-youth';
  return `card-${variant === 'counselor' ? 'counselor' : `youth-${variant}`}`;
};

// 접근성 헬퍼
export const getAccessibleColorPair = (
  backgroundColor: YouthColor
): {
  bg: string;
  text: string;
} => {
  const colorPairs: Record<YouthColor, { bg: string; text: string }> = {
    'youth-orange': { bg: 'bg-youth-orange', text: 'text-white' },
    'youth-gold': { bg: 'bg-youth-gold', text: 'text-gray-800' },
    'youth-yellow': { bg: 'bg-youth-yellow', text: 'text-gray-800' },
    'youth-cream': { bg: 'bg-youth-cream', text: 'text-gray-800' },
    'youth-light-yellow': {
      bg: 'bg-youth-light-yellow',
      text: 'text-gray-800',
    },
    'youth-green': { bg: 'bg-youth-green', text: 'text-success' },
    'youth-olive': { bg: 'bg-youth-olive', text: 'text-gray-800' },
    'youth-soft-brown': { bg: 'bg-youth-soft-brown', text: 'text-white' },
    'youth-light-pink': { bg: 'bg-youth-light-pink', text: 'text-warning' },
    'youth-light-blue': { bg: 'bg-youth-light-blue', text: 'text-info' },
  };

  return colorPairs[backgroundColor];
};

// 컴포넌트 크기 변형
export const COMPONENT_SIZES = {
  button: {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  },
  card: {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  },
  badge: {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  },
} as const;

export type ComponentSize = 'sm' | 'md' | 'lg';
