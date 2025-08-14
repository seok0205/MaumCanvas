import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Info,
  MessageCircle,
  User,
} from 'lucide-react';

import { ReservationGuideCard } from '@/components/dashboard/ReservationGuideCard';
import { CounselingTypeSelector } from '@/components/ui/CounselingTypeSelector';
import { Alert, AlertDescription } from '@/components/ui/feedback/alert';
import { Button } from '@/components/ui/interactive/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/layout/card';
import { useCounselingReservation } from '@/hooks/useCounselingReservation';
import { COUNSELING_TYPE_DATA } from '@/types/counselingType';
import { cn } from '@/utils/cn';

interface CounselingReservationProps {
  // 향후 확장을 위한 props 정의
  // 예: onReservationComplete?: () => void;
  // 예: initialDate?: Date;
}

const CounselingReservation = ({}: CounselingReservationProps) => {
  const {
    selectedDate,
    selectedTime,
    selectedCounselor,
    selectedCounselingType,
    dateOptions,
    timeOptions,
    counselors,
    isLoadingCounselors,
    counselorsError,
    handleDateSelect,
    handleTimeSelect,
    handleCounselorSelect,
    handleCounselingTypeSelect,
    handleReservationConfirm,
    handleGoBack,
    isReservationPending,
    refetchCounselors,
  } = useCounselingReservation();

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4'>
      <div className='mx-auto max-w-4xl space-y-6'>
        {/* 헤더 */}
        <header className='flex items-center gap-4'>
          <Button
            variant='ghost'
            size='icon'
            onClick={handleGoBack}
            className='h-10 w-10 rounded-full bg-white shadow-sm hover:bg-gray-50'
            aria-label='뒤로 가기'
          >
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <h1 className='text-2xl font-bold text-gray-900'>상담 예약</h1>
        </header>

        {/* 날짜 선택 섹션 */}
        <Card
          className='bg-white border-0 drop-shadow-2xl'
          style={{ boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)' }}
        >
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <Calendar className='h-5 w-5 text-blue-600' />
              날짜 선택
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className='grid grid-cols-4 gap-3 sm:grid-cols-7'
              role='group'
              aria-label='날짜 선택'
            >
              {dateOptions.map(option => (
                <Button
                  key={option.date.toISOString()}
                  variant={option.isSelected ? 'default' : 'outline'}
                  className={cn(
                    'h-auto flex-col gap-1 p-3 transition-all rounded-lg',
                    option.isSelected
                      ? 'bg-yellow-100 border-yellow-300 text-yellow-900 hover:bg-yellow-200'
                      : 'hover:bg-gray-50'
                  )}
                  onClick={() => handleDateSelect(option.date)}
                >
                  <Calendar className='h-4 w-4' />
                  <span className='text-xs font-medium'>
                    {option.formattedDate}
                  </span>
                  <span className='text-xs text-gray-500'>
                    ({option.dayOfWeek})
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 시간 선택 섹션 */}
        <Card
          className='bg-white border-0 drop-shadow-2xl'
          style={{ boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)' }}
        >
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-lg'>
              <Clock className='h-5 w-5 text-blue-600' />
              시간 선택
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className='grid grid-cols-4 gap-3 sm:grid-cols-6'
              role='group'
              aria-label='시간 선택'
            >
              {timeOptions.map(option => (
                <Button
                  key={option.time}
                  variant={option.isSelected ? 'default' : 'outline'}
                  className={cn(
                    'h-auto flex-col gap-1 p-3 transition-all rounded-lg',
                    option.isSelected
                      ? 'bg-yellow-100 border-yellow-300 text-yellow-900 hover:bg-yellow-200'
                      : option.isDisabled
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'hover:bg-gray-50'
                  )}
                  onClick={() => handleTimeSelect(option.time)}
                  disabled={!selectedDate || option.isDisabled}
                >
                  <Clock className='h-4 w-4' />
                  <span className='text-sm font-medium'>
                    {option.formattedTime}
                  </span>
                </Button>
              ))}
            </div>
            {selectedDate && (
              <div className='mt-4 text-sm text-gray-600'>
                <Info className='h-4 w-4 inline-block mr-2' />
                이미 지난 시간은 선택할 수 없습니다.
              </div>
            )}
          </CardContent>
        </Card>

        {/* 상담유형 선택 섹션 */}
        {selectedDate && selectedTime && (
          <Card
            className='bg-white border-0 drop-shadow-2xl'
            style={{ boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)' }}
          >
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <MessageCircle className='h-5 w-5 text-purple-600' />
                상담 유형 선택
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CounselingTypeSelector
                selectedType={selectedCounselingType}
                onTypeSelect={handleCounselingTypeSelect}
                categories={COUNSELING_TYPE_DATA}
              />
            </CardContent>
          </Card>
        )}

        {/* 상담사 선택 섹션 */}
        {selectedDate && selectedTime && selectedCounselingType && (
          <Card
            className='bg-white border-0 drop-shadow-2xl'
            style={{ boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)' }}
          >
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <User className='h-5 w-5 text-blue-600' />
                상담사 선택
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingCounselors ? (
                <div className='flex items-center justify-center py-8'>
                  <div className='text-center'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2'></div>
                    <p className='text-gray-600'>상담사를 불러오는 중...</p>
                  </div>
                </div>
              ) : counselorsError ? (
                <Alert variant='destructive'>
                  <Info className='h-4 w-4' />
                  <AlertDescription>
                    상담사 목록을 불러오는데 실패했습니다.
                    <Button
                      variant='link'
                      className='p-0 h-auto text-destructive underline'
                      onClick={() => refetchCounselors()}
                    >
                      다시 시도
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : counselors && counselors.length > 0 ? (
                <div
                  className='space-y-3'
                  role='group'
                  aria-label='상담사 선택'
                >
                  {counselors.map(counselor => (
                    <Button
                      key={counselor.id}
                      variant={
                        selectedCounselor?.id === counselor.id
                          ? 'default'
                          : 'outline'
                      }
                      className={cn(
                        'w-full justify-start gap-3 p-4 h-auto transition-all',
                        selectedCounselor?.id === counselor.id
                          ? 'bg-yellow-100 border-yellow-300 text-yellow-900 hover:bg-yellow-200'
                          : 'hover:bg-gray-50'
                      )}
                      onClick={() => handleCounselorSelect(counselor)}
                    >
                      <User className='h-5 w-5' />
                      <span className='font-medium'>
                        {counselor.counselorName} 상담사
                      </span>
                    </Button>
                  ))}
                </div>
              ) : (
                <Alert>
                  <Info className='h-4 w-4' />
                  <AlertDescription>
                    선택하신 날짜와 시간에 가능한 상담사가 없습니다. 다른 날짜나
                    시간을 선택해주세요.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* 예약 확인 섹션 */}
        {selectedDate &&
          selectedTime &&
          selectedCounselingType &&
          selectedCounselor && (
            <Card
              className='bg-blue-50 border-blue-200 drop-shadow-2xl'
              style={{ boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)' }}
            >
              <CardHeader>
                <CardTitle className='text-lg text-blue-900'>
                  예약 확인
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>날짜</span>
                  <span className='font-medium'>
                    {format(selectedDate, 'M월 d일 (E)', { locale: ko })}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>시간</span>
                  <span className='font-medium'>{selectedTime}</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>상담 유형</span>
                  <span className='font-medium'>
                    {selectedCounselingType.title}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>상담사</span>
                  <span className='font-medium'>
                    {selectedCounselor.counselorName} 상담사
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

        {/* 예약 안내사항 */}
        <ReservationGuideCard variant='reservation' />

        {/* 예약 확정 버튼 */}
        <Button
          onClick={handleReservationConfirm}
          disabled={
            !selectedDate ||
            !selectedTime ||
            !selectedCounselingType ||
            !selectedCounselor ||
            isReservationPending
          }
          className={cn(
            'w-full h-12 text-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2',
            selectedDate && selectedTime && selectedCounselor
              ? 'bg-yellow-500 hover:bg-yellow-600 text-black focus:ring-yellow-500'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed focus:ring-gray-400'
          )}
        >
          {isReservationPending ? (
            <div className='flex items-center gap-2'>
              <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-black'></div>
              예약 처리 중...
            </div>
          ) : (
            '예약 확정하기'
          )}
        </Button>
      </div>
    </div>
  );
};

export { CounselingReservation };
