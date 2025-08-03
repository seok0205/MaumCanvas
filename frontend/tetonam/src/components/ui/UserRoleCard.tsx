import { Card } from '@/components/ui/layout/card';
import type { UserRole } from '@/constants/userRoles';
import { cn } from '@/utils/cn';
import { LucideIcon } from 'lucide-react';

interface UserRoleCardProps {
  userRole: UserRole;
  title: string;
  description: string;
  icon: LucideIcon;
  onSelect: (type: UserRole) => void;
  isSelected: boolean;
}

export function UserRoleCard({
  userRole,
  title,
  description,
  icon: Icon,
  onSelect,
  isSelected,
}: UserRoleCardProps) {
  return (
    <Card
      className={cn(
        'p-6 cursor-pointer transition-all duration-300 hover:shadow-medium border-2',
        isSelected
          ? 'border-primary bg-primary/5 shadow-medium'
          : 'border-border hover:border-primary/50'
      )}
      onClick={() => onSelect(userRole)}
    >
      <div className='text-center space-y-4'>
        <div
          className={cn(
            'w-16 h-16 mx-auto rounded-full flex items-center justify-center',
            isSelected ? 'bg-primary text-primary-foreground' : 'bg-accent'
          )}
        >
          <Icon className='w-8 h-8' />
        </div>

        <div>
          <h3 className='text-lg font-semibold text-foreground mb-2'>
            {title}
          </h3>
          <p className='text-sm text-muted-foreground'>{description}</p>
        </div>
      </div>
    </Card>
  );
}
