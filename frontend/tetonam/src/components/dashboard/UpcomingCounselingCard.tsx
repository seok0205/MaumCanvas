import { Button } from '@/components/ui/interactive/button';
import { Card } from '@/components/ui/layout/card';
import { useUpcomingCounseling } from '@/hooks/useUpcomingCounseling';
import type { CounselingStatus, UpcomingCounseling } from '@/types/api';
import { isValidUpcomingCounseling } from '@/types/api';
import { isValidDateString } from '@/utils/counselingValidation';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { AlertCircle, Calendar, Clock, RefreshCw, User } from 'lucide-react';
import { memo, useCallback } from 'react';

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

const formatDateTime = (dateTimeString: string) => {
  try {
    // 유효성 검사 추가
    if (!isValidDateString(dateTimeString)) {
      throw new Error('Invalid date string');
    }

    const date = new Date(dateTimeString);

    // 유효한 날짜인지 확인
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }

    return {
      date: format(date, 'M월 d일 (E)', { locale: ko }),
      time: format(date, 'HH:mm'),
    };
  } catch {
    return {
      date: '날짜 정보 없음',
      time: '시간 정보 없음',
    };
  }
};

export const UpcomingCounselingCard = memo(() => {
  const {
    upcomingCounseling,
    isLoading,
    error,
    retryCount,
    maxRetries,
    refetch,
    isRetrying,
  } = useUpcomingCounseling();

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

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

  // 로딩 상태 개선
  if (isLoading && !upcomingCounseling) {
    return (
      <Card className='p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-foreground'>
            다가오는 상담
          </h3>
          {isRetrying && retryCount > 0 && (
            <div className='flex items-center text-sm text-muted-foreground'>
              <RefreshCw className='h-4 w-4 animate-spin mr-1' />
              재시도 중... ({retryCount}/{maxRetries})
            </div>
          )}
        </div>
        <div className='text-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3'></div>
          <p className='text-muted-foreground'>
            {isRetrying ? '재시도 중...' : '상담 정보를 불러오는 중...'}
          </p>
        </div>
      </Card>
    );
  }

  // 네트워크 에러 상태 (재시도 중)
  if (error && retryCount < maxRetries) {
    return (
      <Card className='p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-foreground'>
            다가오는 상담
          </h3>
        </div>
        <div className='text-center py-8'>
          <AlertCircle className='w-12 h-12 text-orange-500 mx-auto mb-3' />
          <p className='text-muted-foreground mb-2'>
            데이터를 불러오지 못했습니다
          </p>
          <p className='text-sm text-muted-foreground mb-4'>
            재시도 중... ({retryCount}/{maxRetries})
          </p>
          <div className='flex items-center justify-center space-x-2'>
            <RefreshCw className='w-4 h-4 animate-spin text-muted-foreground' />
            <span className='text-sm text-muted-foreground'>
              자동 재시도 중
            </span>
          </div>
        </div>
      </Card>
    );
  }

  // 최종 에러 상태 (재시도 실패)
  if (error && retryCount >= maxRetries) {
    return (
      <Card className='p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold text-foreground'>
            다가오는 상담
          </h3>
          <Button
            variant='outline'
            size='sm'
            onClick={handleRefresh}
            className='text-xs'
          >
            <RefreshCw className='w-3 h-3 mr-1' />
            새로고침
          </Button>
        </div>
        <div className='text-center py-8'>
          <AlertCircle className='w-12 h-12 text-red-500 mx-auto mb-3' />
          <p className='text-muted-foreground mb-2'>
            데이터를 불러오지 못했습니다
          </p>
          <p className='text-sm text-muted-foreground mb-4'>
            네트워크 연결을 확인하고 다시 시도해주세요
          </p>
          <Button
            variant='outline'
            size='sm'
            onClick={handleRefresh}
            className='text-xs'
          >
            <RefreshCw className='w-3 h-3 mr-1' />
            다시 시도
          </Button>
        </div>
      </Card>
    );
  }

  // 상담이 없는 경우
  if (!upcomingCounseling) {
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
            className='text-muted-foreground hover:text-foreground'
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-3 h-3 mr-1 ${isLoading ? 'animate-spin' : ''}`}
            />
            새로고침
          </Button>
        </div>
        <div className='text-center py-8'>
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

  return (
    <Card className='p-6'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-foreground'>다가오는 상담</h3>
        {/* 상담 정보가 있을 때는 새로고침 버튼 제거 */}
      </div>

      <div className='space-y-4'>
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
              <div className='flex items-center space-x-2'>
                <User className='w-4 h-4 text-muted-foreground' />
                <p className='font-medium text-foreground'>
                  {validatedCounseling.counselor}
                </p>
              </div>
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
          </div>
        </div>
      </div>
    </Card>
  );
});

UpcomingCounselingCard.displayName = 'UpcomingCounselingCard';
