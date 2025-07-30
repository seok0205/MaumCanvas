import { Button } from '@/components/ui/interactive/button';
import { Card } from '@/components/ui/layout/card';
import type { Appointment } from '@/types/dashboard';
import { Clock } from 'lucide-react';

interface AppointmentCardProps {
  appointments: readonly Appointment[];
  userType: 'counselor' | 'student';
}

export const AppointmentCard = ({
  appointments,
  userType,
}: AppointmentCardProps) => {
  const handleAppointmentAction = (appointment: Appointment) => {
    // TODO: 실제 상담 액션 구현
    console.log(`Appointment action: ${appointment.id}`);
  };

  const getAppointmentInfo = (appointment: Appointment) => {
    if (userType === 'counselor') {
      return {
        name: appointment.studentName,
        detail: appointment.grade,
        topic: appointment.topic,
      };
    } else {
      return {
        name: appointment.counselorName,
        detail: '',
        topic: '',
      };
    }
  };

  return (
    <Card
      className='
      p-6 shadow-card border border-border/50
      bg-card/80 backdrop-blur-sm
    '
    >
      <div className='flex items-center justify-between mb-4'>
        <h3
          className='
          text-lg font-semibold text-foreground
          flex items-center
        '
        >
          <Clock className='w-5 h-5 text-primary mr-2' />
          다가오는 상담
        </h3>
        {userType === 'counselor' && (
          <Button variant='ghost' size='sm' aria-label='전체 상담 일정 보기'>
            전체보기
          </Button>
        )}
      </div>
      <div className='space-y-3'>
        {appointments.map((appointment, index) => {
          const info = getAppointmentInfo(appointment);
          const bgColor = index === 0 ? 'bg-primary/5' : 'bg-secondary/10';

          return (
            <div
              key={appointment.id}
              className={`p-3 ${bgColor} rounded-lg`}
              role='listitem'
              aria-label={`상담 예약: ${appointment.date} ${appointment.time}`}
            >
              <div className='flex justify-between items-start'>
                <div>
                  <p className='font-medium text-foreground'>
                    {appointment.date} {appointment.time}
                  </p>
                  <p className='text-sm text-muted-foreground'>{info.name}</p>
                  {info.detail && (
                    <p className='text-sm text-muted-foreground'>
                      {info.detail}
                    </p>
                  )}
                  {info.topic && (
                    <p className='text-xs text-muted-foreground'>
                      {info.topic}
                    </p>
                  )}
                </div>
                <Button
                  size='sm'
                  variant={userType === 'counselor' ? 'default' : 'outline'}
                  onClick={() => handleAppointmentAction(appointment)}
                  aria-label={
                    userType === 'counselor'
                      ? '상담 시작하기'
                      : '상담 상세 정보 보기'
                  }
                >
                  {userType === 'counselor' ? '상담하기' : '상세보기'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
