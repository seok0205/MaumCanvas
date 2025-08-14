import { ApiButton } from '@/components/ui/ApiButton';
import { Button } from '@/components/ui/interactive/button';
import { Card } from '@/components/ui/layout/card';
import { useProgressiveLoading } from '@/hooks/useDelayedLoading';
import { useUpcomingCounselingQuery } from '@/hooks/useUpcomingCounselingQuery';
import { useAuthStore } from '@/stores/useAuthStore';
import type { CounselingStatus, UpcomingCounseling } from '@/types/api';
import { isValidUpcomingCounseling } from '@/types/api';
import { formatDateTime } from '@/utils/dateUtils';
import { addMinutes, isAfter, isBefore } from 'date-fns';
import {
  AlertCircle,
  Calendar,
  Clock,
  RefreshCw,
  User,
  Video,
} from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Props 인터페이스 정의 - TanStack Query Best Practice
interface UpcomingCounselingCardProps {
  counselingData?: UpcomingCounseling | null;
  isLoading?: boolean;
  isFetching?: boolean;
  error?: string | null; // 에러 상태 추가
  onRefresh?: () => Promise<void> | void; // 새로고침 핸들러 추가
}

// 상수 함수들을 컴포넌트 외부로 이동하여 불필요한 재생성 방지
const getStatusText = (status: CounselingStatus): string => {
  switch (status) {
    case 'OPEN':
      return '예정';
    case 'CLOSE':
      return '완료';
    case 'CANCEL':
      return '취소';
    default:
      return status;
  }
};

const getStatusColor = (status: CounselingStatus): string => {
  switch (status) {
    case 'OPEN':
      return 'text-blue-600 bg-blue-100';
    case 'CLOSE':
      return 'text-green-600 bg-green-100';
    case 'CANCEL':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const UpcomingCounselingCard = memo<UpcomingCounselingCardProps>(
  ({
    counselingData = null,
    isLoading: propsIsLoading = false,
    isFetching: propsIsFetching = false,
    error: propsError = null,
    onRefresh: propsOnRefresh,
  }) => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const isCounselor = user?.roles?.some(r => r === 'COUNSELOR');

    // 버튼 중복클릭 방지를 위한 상태
    const [isJoining, setIsJoining] = useState(false);

    // TanStack Query Best Practice: Props 우선, 개별 쿼리는 fallback
    const queryResult = useUpcomingCounselingQuery();

    // Props에서 데이터가 제공되면 사용, 없으면 개별 쿼리 결과 사용
    const upcomingCounseling =
      counselingData !== undefined
        ? counselingData
        : queryResult.upcomingCounseling;
    const isLoading =
      counselingData !== undefined ? propsIsLoading : queryResult.isLoading;
    const isFetching =
      counselingData !== undefined ? propsIsFetching : queryResult.isFetching;
    const error = counselingData !== undefined ? propsError : queryResult.error;
    const refetch =
      counselingData !== undefined
        ? propsOnRefresh || (() => {})
        : queryResult.refetch;

    // Progressive Loading 상태 - 300ms 지연 + 800ms 최소 표시 시간 적용
    const { showSkeleton, isBackgroundFetching: showBackgroundIndicator } =
      useProgressiveLoading({
        isLoading,
        isFetching,
        data: upcomingCounseling,
        error,
        delay: 300, // RAIL 모델 기반 최적 지연 시간
        minDisplayTime: 800, // 스켈레톤 최소 표시 시간으로 깜빡임 방지
      });

    const handleRefresh = useCallback(async () => {
      await refetch();
    }, [refetch]);

    // 입장하기 핸들러 - 중복클릭 방지 로직 추가
    const handleJoin = useCallback(
      async (id: number | string) => {
        if (isJoining) return; // 이미 처리 중이면 무시

        try {
          setIsJoining(true);
          navigate(`/video-call/${id}`);
        } finally {
          // 네비게이션이 완료되면 상태 리셋 (실제로는 컴포넌트가 언마운트됨)
          setTimeout(() => setIsJoining(false), 1000);
        }
      },
      [navigate, isJoining]
    );

    // 데이터 유효성 검사 함수 개선 - 더 구체적인 검증과 로깅
    const validateCounselingData = useCallback((data: unknown) => {
      if (!data) {
        console.debug('No counseling data provided');
        return null;
      }

      // 타입 가드를 사용한 유효성 검사
      if (!isValidUpcomingCounseling(data)) {
        console.warn('Invalid counseling data structure:', {
          received: data,
          expected: 'UpcomingCounseling interface',
          timestamp: new Date().toISOString(),
        });
        return null;
      }

      // 추가 비즈니스 로직 검증
      const counselingData = data as UpcomingCounseling;

      // 날짜가 과거인지 확인 (선택적 경고)
      try {
        const counselingDate = new Date(counselingData.time);
        const now = new Date();

        if (counselingDate < now) {
          console.info('Counseling date is in the past:', {
            counselingDate: counselingDate.toISOString(),
            currentDate: now.toISOString(),
          });
        }
      } catch (error) {
        console.warn('Failed to parse counseling date:', counselingData.time);
      }

      return counselingData;
    }, []);

    // Progressive Loading 로직 - Best Practice 적용
    if (showSkeleton) {
      return (
        <Card className='h-full flex flex-col p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-foreground'>
              다가오는 상담
            </h3>
          </div>
          <div className='flex-1 flex flex-col justify-center space-y-4'>
            <div className='flex items-center justify-between p-4 bg-accent/50 rounded-lg'>
              <div className='flex items-center space-x-3'>
                <div className='text-center space-y-2'>
                  <div className='h-4 w-16 bg-muted animate-pulse rounded'></div>
                  <div className='h-3 w-12 bg-muted animate-pulse rounded'></div>
                </div>
                <div className='space-y-2'>
                  <div className='h-4 w-24 bg-muted animate-pulse rounded'></div>
                  <div className='h-3 w-16 bg-muted animate-pulse rounded'></div>
                </div>
              </div>
              <div className='text-right space-y-2'>
                <div className='h-6 w-12 bg-muted animate-pulse rounded-full'></div>
                <div className='h-8 w-16 bg-muted animate-pulse rounded'></div>
              </div>
            </div>
          </div>
          <div className='text-center mt-4' aria-live='polite' role='status'>
            <p className='text-sm text-muted-foreground'>
              상담 정보를 불러오는 중...
            </p>
          </div>
        </Card>
      );
    }

    // 에러 상태 처리 - 더 나은 UX와 명확한 안내
    if (error) {
      return (
        <Card className='h-full flex flex-col p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-foreground'>
              다가오는 상담
            </h3>
          </div>
          <div className='flex-1 flex flex-col justify-center text-center py-8'>
            <AlertCircle className='w-12 h-12 text-red-500 mx-auto mb-3' />
            <p className='text-muted-foreground mb-2'>
              상담 정보를 불러오지 못했습니다
            </p>
            <p className='text-sm text-muted-foreground mb-4'>
              네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요
            </p>
            <div className='flex flex-col items-center space-y-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => refetch()}
                className='text-xs'
              >
                <RefreshCw className='w-3 h-3 mr-1' />
                다시 시도
              </Button>
              <p className='text-xs text-muted-foreground'>
                문제가 지속되면 새로고침을 해보세요
              </p>
            </div>
          </div>
        </Card>
      );
    }

    // 상담이 없는 경우
    if (!upcomingCounseling) {
      return (
        <Card className='h-full flex flex-col p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-foreground'>
              다가오는 상담
            </h3>
          </div>
          <div className='flex-1 flex flex-col justify-center text-center py-8'>
            <Calendar className='w-12 h-12 text-muted-foreground mx-auto mb-3' />
            <p className='text-muted-foreground mb-2'>
              예정된 상담 일정이 없습니다
            </p>
            <p className='text-sm text-muted-foreground'>
              상담을 예약하거나 새로고침으로 최신 정보를 확인하세요
            </p>
          </div>
        </Card>
      );
    }

    // 개선된 데이터 유효성 검사 - validateCounselingData 함수 활용
    const validatedCounseling = validateCounselingData(upcomingCounseling);
    if (!validatedCounseling) {
      return (
        <Card className='p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-foreground'>
              다가오는 상담
            </h3>
            <Button
              onClick={handleRefresh}
              variant='ghost'
              size='sm'
              className='text-destructive hover:text-destructive/80'
            >
              <RefreshCw className='w-3 h-3 mr-1' />
              다시 로드
            </Button>
          </div>
          <div className='text-center py-8'>
            <AlertCircle className='w-12 h-12 text-yellow-500 mx-auto mb-3' />
            <p className='text-muted-foreground mb-2'>데이터 형식 오류</p>
            <p className='text-sm text-muted-foreground'>
              잘못된 형식의 데이터를 받았습니다. 다시 로드해주세요.
            </p>
          </div>
        </Card>
      );
    }

    // 정상적인 상담 정보 표시 - 개선된 유효성 검사 적용
    const { date, time } = formatDateTime(validatedCounseling.time);

    // 상담 입장 가능 여부 판단 로직 (상담시간 10분 전부터 상담시간+59분까지 활성화)
    const canStart = (() => {
      try {
        const now = new Date();
        const appointmentTime = new Date(validatedCounseling.time);

        // 유효한 날짜인지 확인
        if (isNaN(appointmentTime.getTime())) {
          return false;
        }

        // 상담시간 10분 전 시점과 59분 후 시점 계산
        const tenMinutesBefore = addMinutes(appointmentTime, -10);
        const fiftyNineMinutesAfter = addMinutes(appointmentTime, 59);

        // 현재 시간이 10분 전 이후이고 59분 후 이전인지 확인
        const canStartNow =
          isAfter(now, tenMinutesBefore) &&
          isBefore(now, fiftyNineMinutesAfter);

        return canStartNow;
      } catch (error) {
        console.warn('상담 시간 계산 중 오류 발생:', error);
        return false;
      }
    })();

    // 버튼 텍스트와 상태 결정
    const getButtonStatus = () => {
      if (isJoining) {
        return { text: '입장 중...', disabled: true };
      }

      if (!canStart) {
        const now = new Date();
        const appointmentTime = new Date(validatedCounseling.time);
        const tenMinutesBefore = addMinutes(appointmentTime, -10);
        const fiftyNineMinutesAfter = addMinutes(appointmentTime, 59);

        if (isBefore(now, tenMinutesBefore)) {
          return { text: '입장 대기', disabled: true };
        } else if (isAfter(now, fiftyNineMinutesAfter)) {
          return { text: '시간 만료', disabled: true };
        }
        return { text: '입장 불가', disabled: true };
      }

      return { text: '입장하기', disabled: false };
    };

    const buttonStatus = getButtonStatus();

    return (
      <Card className='h-full flex flex-col p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-foreground'>
            다가오는 상담
          </h3>
          {/* 백그라운드 업데이트 시 작은 로딩 인디케이터 */}
          {showBackgroundIndicator && (
            <div className='flex items-center text-xs text-muted-foreground'>
              <RefreshCw className='w-3 h-3 animate-spin mr-1' />
              업데이트 중
            </div>
          )}
        </div>

        <div className='flex-1 flex flex-col justify-center'>
          <div className='flex items-center justify-between p-4 bg-accent/50 rounded-lg'>
            <div className='flex items-center space-x-3'>
              <div className='text-center'>
                <p className='text-sm font-medium text-foreground'>{date}</p>
                <p className='text-xs text-muted-foreground flex items-center'>
                  <Clock className='w-3 h-3 mr-1' />
                  {time}
                </p>
              </div>
              <div className='space-y-1'>
                {isCounselor ? (
                  // 상담사/학생 모두 백엔드에서 역할에 따라 상대방 이름을 name으로 반환
                  <div className='flex items-center space-x-2'>
                    <User className='w-4 h-4 text-muted-foreground' />
                    <p className='font-medium text-foreground'>
                      {validatedCounseling.name}
                    </p>
                  </div>
                ) : (
                  <div className='flex items-center space-x-2'>
                    <User className='w-4 h-4 text-muted-foreground' />
                    <p className='font-medium text-foreground'>
                      {validatedCounseling.name}
                    </p>
                  </div>
                )}
                <p className='text-sm text-muted-foreground'>
                  {validatedCounseling.type}
                </p>
              </div>
            </div>
            <div className='text-right'>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  validatedCounseling.status
                )}`}
              >
                {getStatusText(validatedCounseling.status)}
              </span>
              <div className='mt-2'>
                <ApiButton
                  variant={canStart ? 'default' : 'outline'}
                  size='sm'
                  disabled={buttonStatus.disabled}
                  onClick={() => handleJoin(validatedCounseling.id)}
                  isLoading={isJoining}
                  loadingText='입장 중...'
                  className='text-xs'
                >
                  <Video className='w-3 h-3 mr-1' /> {buttonStatus.text}
                </ApiButton>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }
);

UpcomingCounselingCard.displayName = 'UpcomingCounselingCard';
