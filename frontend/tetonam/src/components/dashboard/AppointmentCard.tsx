import { Button } from '@/components/ui/interactive/button';
import { Card } from '@/components/ui/layout/card';
import type { Appointment } from '@/types/dashboard';
import { Calendar, Video } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AppointmentCardProps {
  appointments: readonly Appointment[];
  userRole: 'COUNSELOR' | 'USER';
}

export const AppointmentCard = ({
  appointments,
  userRole,
}: AppointmentCardProps) => {
  const navigate = useNavigate();
  const [loadingAppointmentId, setLoadingAppointmentId] = useState<
    string | null
  >(null);

  // 날짜 + 요일 포맷 (예약된 데이터가 변하지 않도록 표시만 가공)
  const formatDateWithWeekday = (dateStr: string, timeStr: string) => {
    try {
      // timeStr이 HH:mm 형태라고 가정 (초 없음) / 파싱 실패 시 원본 반환
      const isoCandidate = /T/.test(dateStr)
        ? dateStr
        : `${dateStr} ${timeStr}`;
      const d = new Date(isoCandidate);
      if (isNaN(d.getTime())) return dateStr; // 파싱 실패 시 fallback
      const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
      const w = weekdays[d.getDay()];
      return `${dateStr} (${w})`;
    } catch {
      return dateStr;
    }
  };

  const canStartAppointment = (_appointment: Appointment): boolean => {
    // 🚧 테스트용: 화상통화 테스트를 위해 시간 제한 로직을 주석처리하고 상시 활성화
    // 테스트용: 항상 true 반환 (상시 활성화)
    return true;

    // 원래 로직 (테스트 완료 후 주석해제)
    /*
    // 상담예약시간 10분 전부터 59분 후까지 활성화
    const now = new Date();
    const appointmentTime = new Date(`${_appointment.date} ${_appointment.time}`);
    const timeDiff = appointmentTime.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);

    // 상담시간 10분 전(-10) ~ 상담시간 59분 후(-59) 구간에서 활성화
    return minutesDiff >= -59 && minutesDiff <= 10;
    */
  };

  const handleAppointmentAction = async (appointment: Appointment) => {
    setLoadingAppointmentId(appointment.id);
    try {
      navigate(`/video-call/${appointment.id}`);
    } finally {
      setLoadingAppointmentId(null);
    }
  };

  const getTitle = () => {
    // 학생/상담사 동일 타이틀
    return '다가오는 상담';
  };

  const getEmptyMessage = () => {
    if (userRole === 'COUNSELOR') {
      return '오늘 예정된 상담이 없습니다.';
    }
    return '예약된 상담이 없습니다.';
  };

  const getAppointmentInfo = (appointment: Appointment) => {
    if (userRole === 'COUNSELOR') {
      // 학생 대시보드 구성과 동일: 이름 + 라벨
      return (
        <div className='space-y-1'>
          <p className='font-medium text-foreground'>
            {appointment.studentName || '-'}
          </p>
          <p className='text-sm text-muted-foreground'>학생</p>
        </div>
      );
    }
    return (
      <div className='space-y-1'>
        <p className='font-medium text-foreground'>
          {appointment.counselorName}
        </p>
        <p className='text-sm text-muted-foreground'>전문 상담사</p>
      </div>
    );
  };

  return (
    <Card className='p-6'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-foreground'>{getTitle()}</h3>
      </div>

      {appointments.length === 0 ? (
        <div className='text-center py-8'>
          <Calendar className='w-12 h-12 text-muted-foreground mx-auto mb-3' />
          <p className='text-muted-foreground'>{getEmptyMessage()}</p>
        </div>
      ) : (
        <div className='space-y-4'>
          {appointments.map(appointment => (
            <div
              key={appointment.id}
              className='flex items-center justify-between p-3 bg-accent/50 rounded-lg'
            >
              <div className='flex items-center space-x-3'>
                <div className='text-center'>
                  <p className='text-sm font-medium text-foreground'>
                    {formatDateWithWeekday(appointment.date, appointment.time)}
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    {appointment.time}
                  </p>
                </div>
                {getAppointmentInfo(appointment)}
              </div>
              <div>
                {(() => {
                  const isLoading = loadingAppointmentId === appointment.id;
                  const canStart = canStartAppointment(appointment);
                  const label =
                    userRole === 'COUNSELOR' ? '상담 시작' : '입장하기';
                  return (
                    <Button
                      variant={canStart ? 'default' : 'outline'}
                      size='sm'
                      disabled={!canStart || isLoading}
                      onClick={() => handleAppointmentAction(appointment)}
                      className='text-xs'
                    >
                      {isLoading ? (
                        '연결 중...'
                      ) : canStart ? (
                        <>
                          <Video className='w-3 h-3 mr-1' />
                          {label}
                        </>
                      ) : userRole === 'COUNSELOR' ? (
                        '대기 중'
                      ) : (
                        '예약됨'
                      )}
                    </Button>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
