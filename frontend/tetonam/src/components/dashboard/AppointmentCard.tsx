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

  const canStartAppointment = (appointment: Appointment): boolean => {
    // 테스트 기간: 언제든지 활성화하되, 상담 시간 30분 경과 후에는 비활성화
    const now = new Date();
    const appointmentTime = new Date(`${appointment.date} ${appointment.time}`);
    const timeDiff = appointmentTime.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    return minutesDiff >= -30;
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
    if (userRole === 'COUNSELOR') {
      return '오늘의 상담 일정';
    }
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
      return (
        <div className='space-y-1'>
          <p className='font-medium text-foreground'>
            {appointment.studentName}
          </p>
          <p className='text-sm text-muted-foreground'>
            {appointment.grade} • {appointment.topic}
          </p>
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
                    {appointment.date}
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
