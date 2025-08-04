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
  // 역할별 테마 색상 정의
  const getRoleTheme = (role: UserRole) => {
    switch (role) {
      case 'USER':
        return {
          bg: isSelected
            ? 'bg-light-blue/35 text-light-blue'
            : 'bg-light-blue/10 text-light-blue',
          border: isSelected ? 'border-light-blue' : 'border-light-blue/30',
          hover: 'hover:border-light-blue/60 hover:bg-light-blue/15',
        };
      case 'COUNSELOR':
        return {
          bg: isSelected ? 'bg-lilac/35 text-lilac' : 'bg-lilac/10 text-lilac',
          border: isSelected ? 'border-lilac' : 'border-lilac/30',
          hover: 'hover:border-lilac/60 hover:bg-lilac/15',
        };
      default:
        return {
          bg: isSelected
            ? 'bg-primary/35 text-primary'
            : 'bg-accent text-accent-foreground',
          border: isSelected ? 'border-primary' : 'border-border',
          hover: 'hover:border-primary/50',
        };
    }
  };

  const theme = getRoleTheme(userRole);

  return (
    <Card
      className={cn(
        'p-6 cursor-pointer transition-all duration-300 hover:shadow-medium border-2',
        isSelected
          ? `${theme.bg} ${theme.border} shadow-medium`
          : `${theme.border} ${theme.hover}`
      )}
      onClick={() => onSelect(userRole)}
    >
      <div className='text-center space-y-4'>
        <div
          className={cn(
            'w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-all duration-300',
            theme.bg
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
