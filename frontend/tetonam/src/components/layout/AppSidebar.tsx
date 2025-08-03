import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/navigation/sidebar';
import { COUNSELOR_MENU_ITEMS, USER_MENU_ITEMS } from '@/constants/menu';
import { useAuthStore } from '@/stores/useAuthStore';
import { getNavLinkClassName } from '@/utils/navigation';
import { Heart } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const AppSidebar = () => {
  const { state } = useSidebar();
  const { user } = useAuthStore();

  const menuItems = user?.roles.includes('USER')
    ? USER_MENU_ITEMS
    : COUNSELOR_MENU_ITEMS;

  return (
    <Sidebar
      className={state === 'collapsed' ? 'w-14' : 'w-40'}
      collapsible='icon'
    >
      <SidebarHeader
        className={`border-b border-border/50 ${state === 'collapsed' ? 'p-2' : 'p-4'}`}
      >
        <div className='flex items-center justify-center'>
          <Heart
            className={`w-4 h-4 text-primary ${state === 'collapsed' ? '' : 'mr-2'}`}
          />
          {state !== 'collapsed' && (
            <span className='font-bold text-lg text-foreground'>
              마음 캔버스
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={state === 'collapsed' ? 'sr-only' : ''}>
            메뉴
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavLinkClassName}>
                      <item.icon className='mr-2 w-4 h-4' />
                      {state !== 'collapsed' && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
