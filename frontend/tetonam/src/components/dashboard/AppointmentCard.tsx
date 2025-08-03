import { Button } from '@/components/ui/interactive/button';
import { Card } from '@/components/ui/layout/card';
import type { Appointment } from '@/types/dashboard';
import { Calendar } from 'lucide-react';

interface AppointmentCardProps {
  appointments: readonly Appointment[];
  userRole: 'COUNSELOR' | 'USER';
}

export const AppointmentCard = ({
  appointments,
  userRole,
}: AppointmentCardProps) => {
  const handleAppointmentAction = (appointment: Appointment) => {
    // TODO: 실제 상담 액션 구현
    console.log(`Appointment action: ${appointment.id}`);
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
        <Button
          variant={userRole === 'COUNSELOR' ? 'default' : 'outline'}
          size='sm'
          className='text-xs'
        >
          {userRole === 'COUNSELOR' ? '상담하기' : '상세보기'}
        </Button>
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
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
