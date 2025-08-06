import React from 'react';
import { useYouthColors } from '../hooks/useYouthColors';
import type {
  AssessmentOptionProps,
  ComponentSize,
  CounselorCardProps,
  ProgressBarProps,
  TimeSlotProps,
  YouthBadgeProps,
  YouthButtonProps,
  YouthCardProps,
  YouthInputProps,
} from '../types/youthColors';

/**
 * 청소년 친화적 버튼 컴포넌트
 * 따뜻한 파스텔 색상 시스템과 접근성을 구현합니다
 */
const YouthButton = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  className = '',
}: YouthButtonProps) => {
  const { getButtonClasses, getTouchFriendlyClasses } = useYouthColors();

  const buttonClasses = `
    ${getButtonClasses(variant, size)}
    ${getTouchFriendlyClasses()}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `.trim();

  return (
    <button
      className={buttonClasses}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      type='button'
    >
      {children}
    </button>
  );
};

/**
 * 청소년 친화적 카드 컴포넌트
 * 상담사 정보, 진행 상황 등을 표시하기에 완벽합니다
 */
const YouthCard = ({
  variant = 'default',
  children,
  onClick,
  selected = false,
  className = '',
}: YouthCardProps) => {
  const { getCardClasses } = useYouthColors();

  const cardVariant = selected ? 'selected' : variant;
  const cardClasses = `
    ${getCardClasses(cardVariant)}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `.trim();

  return (
    <div className={cardClasses} onClick={onClick}>
      {children}
    </div>
  );
};

/**
 * 청소년 친화적 배지 컴포넌트
 * 적절한 상태 색상이 있는 상태 표시기용입니다
 */
const YouthBadge = ({ variant, children, className = '' }: YouthBadgeProps) => {
  const { getBadgeClasses } = useYouthColors();

  const badgeClasses = `
    ${getBadgeClasses(variant)}
    ${className}
  `.trim();

  return <span className={badgeClasses}>{children}</span>;
};

/**
 * 청소년 친화적 입력 컴포넌트
 * 따뜻한 노란색 팔레트를 사용한 포커스 상태가 있습니다
 */
const YouthInput = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  disabled = false,
}: YouthInputProps) => {
  const { getInputClasses, getTouchFriendlyClasses } = useYouthColors();

  const inputClasses = `
    ${getInputClasses()}
    ${getTouchFriendlyClasses()}
    w-full
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `.trim();

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={inputClasses}
      disabled={disabled}
    />
  );
};

/**
 * 심리 평가 옵션 컴포넌트
 * 선택 상태가 있는 심리 평가용입니다
 */
const AssessmentOption = ({
  id,
  title,
  description,
  selected = false,
  onClick,
}: AssessmentOptionProps) => {
  const handleClick = () => {
    if (onClick) onClick(id);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        assessment-option
        ${selected ? 'assessment-option-selected' : ''}
        transition-youth
        cursor-pointer
      `.trim()}
    >
      <div className='flex items-start space-x-3'>
        <div
          className={`
          w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5
          ${
            selected ? 'bg-youth-orange border-youth-orange' : 'border-gray-300'
          }
        `}
        >
          {selected && (
            <svg
              className='w-3 h-3 text-white'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                clipRule='evenodd'
              />
            </svg>
          )}
        </div>
        <div className='flex-1'>
          <h4 className='font-medium text-gray-800 mb-1'>{title}</h4>
          {description && (
            <p className='text-sm text-gray-600'>{description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * 상담사 카드 컴포넌트
 * 상담사 정보 표시 전용 카드입니다
 */
const CounselorCard = ({
  id,
  name,
  specialty,
  rating,
  available = true,
  selected = false,
  onClick,
}: CounselorCardProps) => {
  const handleClick = () => {
    if (onClick && available) onClick(id);
  };

  return (
    <YouthCard
      variant='counselor'
      selected={selected}
      onClick={handleClick}
      className={`
        ${!available ? 'opacity-50 cursor-not-allowed' : ''}
      `.trim()}
    >
      <div className='flex items-center space-x-4 mb-4'>
        <div className='w-12 h-12 bg-youth-green rounded-full flex items-center justify-center'>
          <span className='text-white font-bold text-lg'>{name.charAt(0)}</span>
        </div>
        <div className='flex-1'>
          <h4 className='font-semibold text-gray-800'>{name}</h4>
          <p className='text-sm text-gray-600'>{specialty}</p>
        </div>
      </div>

      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-1'>
          <span className='text-yellow-500'>⭐</span>
          <span className='text-sm font-medium text-gray-700'>{rating}</span>
        </div>
        <YouthBadge variant={available ? 'success' : 'warning'}>
          {available ? '예약 가능' : '예약 불가'}
        </YouthBadge>
      </div>
    </YouthCard>
  );
};

/**
 * 시간 슬롯 컴포넌트
 * 명확한 선택 상태를 가진 예약용입니다
 */
const TimeSlot = ({
  time,
  available,
  selected = false,
  onClick,
}: TimeSlotProps) => {
  const handleClick = () => {
    if (onClick && available) onClick(time);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        time-slot
        ${selected ? 'time-slot-selected' : ''}
        ${!available ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `.trim()}
    >
      <span className='text-sm font-medium'>{time}</span>
    </div>
  );
};

/**
 * 프로그래스 바 컴포넌트
 * 청소년 친화적 스타일로 완성 진행률을 보여줍니다
 */
const ProgressBar = ({
  current,
  total,
  showPercentage = true,
  className = '',
}: ProgressBarProps) => {
  const percentage = Math.round((current / total) * 100);

  return (
    <div className={`w-full ${className}`}>
      <div className='progress-youth'>
        <div
          className='progress-youth-fill'
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <div className='flex justify-between text-sm mt-2'>
          <span className='text-gray-600'>
            {current}/{total} 완료
          </span>
          <span className='text-youth-orange font-medium'>{percentage}%</span>
        </div>
      )}
    </div>
  );
};

/**
 * 페이지 헤더 컴포넌트
 * 청소년 친화적 그라디언트가 적용된 표준화된 헤더입니다
 */
const YouthPageHeader = ({
  title,
  subtitle,
  children,
  className = '',
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`bg-gradient-youth-header rounded-2xl p-8 mb-8 shadow-youth ${className}`}
    >
      <h1 className='text-3xl md:text-4xl font-bold text-gray-800 mb-2'>
        {title}
      </h1>
      {subtitle && <p className='text-lg text-gray-700 mb-4'>{subtitle}</p>}
      {children}
    </div>
  );
};

/**
 * 네비게이션 탭 컴포넌트
 * 청소년 친화적 탭 네비게이션입니다
 */
const YouthTabs = ({
  tabs,
  activeTab,
  onTabChange,
  className = '',
}: {
  tabs: Array<{ id: string; label: string }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}) => {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={activeTab === tab.id ? 'tab-youth-active' : 'tab-youth'}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

/**
 * 로딩 컴포넌트
 * 따뜻한 색상의 청소년 친화적 로딩 상태입니다
 */
const YouthLoading = ({
  size = 'md',
  text,
  className = '',
}: {
  size?: ComponentSize;
  text?: string;
  className?: string;
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex items-center justify-center space-x-3 ${className}`}>
      <div className={`${sizeClasses[size]} animate-spin`}>
        <div className='w-full h-full border-4 border-youth-cream border-t-youth-orange rounded-full'></div>
      </div>
      {text && <span className='text-gray-600 font-medium'>{text}</span>}
    </div>
  );
};

/**
 * 빈 상태 컴포넌트
 * 표시할 콘텐츠가 없을 때 사용됩니다
 */
const YouthEmptyState = ({
  icon,
  title,
  description,
  action,
  className = '',
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && <div className='mb-4 text-youth-green'>{icon}</div>}
      <h3 className='text-lg font-semibold text-gray-800 mb-2'>{title}</h3>
      {description && (
        <p className='text-gray-600 mb-6 max-w-md mx-auto'>{description}</p>
      )}
      {action}
    </div>
  );
};

export {
  AssessmentOption,
  CounselorCard,
  ProgressBar,
  TimeSlot,
  YouthBadge,
  YouthButton,
  YouthCard,
  YouthEmptyState,
  YouthInput,
  YouthLoading,
  YouthPageHeader,
  YouthTabs,
};
