import { useCallback, useMemo } from 'react';
import type {
  ComponentSize,
  YouthBadgeVariant,
  YouthButtonVariant,
  YouthCardVariant,
  YouthColor,
  YouthGradient,
  YouthStateColor,
} from '../types/youthColors';
import {
  COMPONENT_SIZES,
  getAccessibleColorPair,
  getBadgeClass,
  getButtonClass,
  getCardClass,
  getStateColorClass,
  getYouthColorClass,
  YOUTH_COLORS,
} from '../types/youthColors';

/**
 * 청소년 친화적 색상 시스템 관리를 위한 커스텀 훅
 * 청소년 정신건강 플랫폼을 위해 특별히 설계된
 * 따뜻하고 파스텔톤의 색상 팔레트 작업을 위한 유틸리티 제공
 */
export const useYouthColors = () => {
  // 색상 클래스 생성기
  const getColorClasses = useCallback(
    (
      color: YouthColor,
      types: ('bg' | 'text' | 'border')[] = ['bg']
    ): string => {
      return types.map(type => getYouthColorClass(color, type)).join(' ');
    },
    []
  );

  // 버튼 클래스 생성기
  const getButtonClasses = useCallback(
    (
      variant: YouthButtonVariant = 'primary',
      size: ComponentSize = 'md',
      additionalClasses?: string
    ): string => {
      const baseClass = getButtonClass(variant);
      const sizeClass = COMPONENT_SIZES.button[size];
      return [baseClass, sizeClass, additionalClasses]
        .filter(Boolean)
        .join(' ');
    },
    []
  );

  // 카드 클래스 생성기
  const getCardClasses = useCallback(
    (
      variant: YouthCardVariant = 'default',
      size: ComponentSize = 'md',
      additionalClasses?: string
    ): string => {
      const baseClass = getCardClass(variant);
      const sizeClass = COMPONENT_SIZES.card[size];
      return [baseClass, sizeClass, additionalClasses]
        .filter(Boolean)
        .join(' ');
    },
    []
  );

  // 배지 클래스 생성기
  const getBadgeClasses = useCallback(
    (
      variant: YouthBadgeVariant,
      size: ComponentSize = 'md',
      additionalClasses?: string
    ): string => {
      const baseClass = getBadgeClass(variant);
      const sizeClass = COMPONENT_SIZES.badge[size];
      return [baseClass, sizeClass, additionalClasses]
        .filter(Boolean)
        .join(' ');
    },
    []
  );

  // 상태 기반 스타일링
  const getStateClasses = useCallback((state: YouthStateColor): string => {
    return getStateColorClass(state);
  }, []);

  // 그라디언트 배경 생성기
  const getGradientClass = useCallback((gradient: YouthGradient): string => {
    return `bg-gradient-youth-${gradient}`;
  }, []);

  // 접근성 호환 색상 쌍
  const getAccessibleColors = useCallback((backgroundColor: YouthColor) => {
    return getAccessibleColorPair(backgroundColor);
  }, []);

  // 페이지별 색상 스킴
  const getPageColorScheme = useCallback((page: string) => {
    const pageSchemes = {
      home: {
        background: 'bg-gradient-youth-warm',
        hero: 'bg-gradient-youth-header',
        primaryAction: 'btn-youth-primary',
        card: 'card-youth',
      },
      assessment: {
        background: 'bg-youth-light-yellow',
        progressBar: 'bg-youth-orange',
        selectedOption: 'bg-youth-light-yellow border-youth-orange',
        submitButton: 'btn-youth-primary',
      },
      booking: {
        background: 'bg-gradient-youth-subtle',
        selectedDate: 'bg-youth-orange text-white',
        availableTime: 'bg-youth-light-yellow',
        counselorCard: 'card-counselor',
      },
      community: {
        background: 'bg-youth-cream',
        activeCategory: 'bg-youth-orange text-white',
        inactiveCategory: 'bg-youth-cream',
        interactionButton: 'btn-youth-success',
      },
      profile: {
        background: 'bg-gradient-youth-subtle',
        activeNav: 'bg-youth-light-yellow border-l-4 border-youth-orange',
        infoCard: 'card-youth',
      },
    };

    return pageSchemes[page as keyof typeof pageSchemes] || pageSchemes.home;
  }, []);

  // 컴포넌트 상태 헬퍼
  const getInteractionStates = useCallback((baseClasses: string) => {
    return {
      default: baseClasses,
      hover: `${baseClasses} hover:shadow-youth-hover hover:scale-105`,
      active: `${baseClasses} active:scale-95`,
      focus: `${baseClasses} focus-youth`,
      disabled: `${baseClasses} opacity-50 cursor-not-allowed`,
    };
  }, []);

  // 애니메이션 및 전환 헬퍼
  const getTransitionClasses = useCallback(
    (type: 'smooth' | 'spring' | 'youth' = 'youth'): string => {
      const transitions = {
        smooth: 'transition-smooth',
        spring: 'transition-spring',
        youth: 'transition-youth',
      };
      return transitions[type];
    },
    []
  );

  // 그림자 헬퍼
  const getShadowClasses = useCallback(
    (
      variant:
        | 'soft'
        | 'medium'
        | 'card'
        | 'hover'
        | 'youth'
        | 'youth-hover' = 'youth'
    ): string => {
      return `shadow-${variant}`;
    },
    []
  );

  // 반응형 색상 헬퍼
  const getResponsiveColorClasses = useCallback(
    (
      colorConfig: {
        mobile?: YouthColor;
        tablet?: YouthColor;
        desktop?: YouthColor;
      },
      type: 'bg' | 'text' | 'border' = 'bg'
    ): string => {
      const classes = [];

      if (colorConfig.mobile) {
        classes.push(`${type}-${colorConfig.mobile}`);
      }
      if (colorConfig.tablet) {
        classes.push(`md:${type}-${colorConfig.tablet}`);
      }
      if (colorConfig.desktop) {
        classes.push(`lg:${type}-${colorConfig.desktop}`);
      }

      return classes.join(' ');
    },
    []
  );

  // 폼 입력 스타일링
  const getInputClasses = useCallback(
    (
      state: 'default' | 'focus' | 'error' | 'success' = 'default',
      additionalClasses?: string
    ): string => {
      const baseClass = 'input-youth';
      const stateClasses = {
        default: '',
        focus: 'bg-youth-light-yellow border-youth-orange',
        error: 'bg-youth-light-pink border-red-400',
        success: 'bg-youth-green border-green-400',
      };

      return [baseClass, stateClasses[state], additionalClasses]
        .filter(Boolean)
        .join(' ');
    },
    []
  );

  // 터치 친화적 크기 조정
  const getTouchFriendlyClasses = useCallback((): string => {
    return 'touch-target min-h-[44px] min-w-[44px]';
  }, []);

  // 동적 사용을 위한 색상 팔레트
  const colorPalette = useMemo(() => YOUTH_COLORS, []);

  // CSS 커스텀 속성 헬퍼
  const getCSSVariable = useCallback((variableName: string): string => {
    if (typeof window !== 'undefined') {
      return getComputedStyle(document.documentElement)
        .getPropertyValue(variableName)
        .trim();
    }
    return '';
  }, []);

  // 테마 검증
  const validateColorCombination = useCallback(
    (backgroundColor: YouthColor, textColor: string): boolean => {
      // 실제 구현에서는 WCAG 대비율을 확인할 것입니다
      // 현재는 미리 정의된 접근 가능한 쌍을 사용합니다
      const accessiblePair = getAccessibleColorPair(backgroundColor);
      return accessiblePair.text.includes(textColor);
    },
    []
  );

  return {
    // 클래스 생성기
    getColorClasses,
    getButtonClasses,
    getCardClasses,
    getBadgeClasses,
    getStateClasses,
    getGradientClass,
    getInputClasses,

    // 접근성
    getAccessibleColors,
    validateColorCombination,

    // 페이지별 헬퍼
    getPageColorScheme,

    // 상호작용 상태
    getInteractionStates,
    getTransitionClasses,
    getShadowClasses,
    getTouchFriendlyClasses,

    // 반응형 헬퍼
    getResponsiveColorClasses,

    // 데이터 접근
    colorPalette,
    getCSSVariable,

    // 일반적인 사용 사례를 위한 미리 정의된 조합
    presets: {
      primaryButton: 'btn-youth-primary touch-target transition-youth',
      secondaryButton: 'btn-youth-secondary touch-target transition-youth',
      successButton: 'btn-youth-success touch-target transition-youth',
      defaultCard: 'card-youth transition-youth',
      selectedCard: 'card-youth-selected transition-youth',
      counselorCard: 'card-counselor transition-youth',
      defaultInput: 'input-youth focus-youth transition-youth',
      activeTab: 'tab-youth-active transition-youth',
      inactiveTab: 'tab-youth transition-youth',
      successBadge: 'badge-youth-success',
      warningBadge: 'badge-youth-warning',
      infoBadge: 'badge-youth-info',
      pendingBadge: 'badge-youth-pending',
      pageBackground: 'bg-gradient-youth-warm min-h-screen',
      headerBackground: 'bg-gradient-youth-header',
      cardShadow: 'shadow-youth hover:shadow-youth-hover',
    },
  };
};

export default useYouthColors;
