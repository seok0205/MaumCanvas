import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/navigation/sidebar';
import { COUNSELOR_MENU_ITEMS, USER_MENU_ITEMS } from '@/constants/menu';
import { useAuthStore } from '@/stores/useAuthStore';
import { getNavLinkClassName } from '@/utils/navigation';
import { NavLink } from 'react-router-dom';

export const AppSidebar = () => {
  const { state } = useSidebar();
  const { user } = useAuthStore();

  const menuItems = user?.roles.includes('USER')
    ? USER_MENU_ITEMS
    : COUNSELOR_MENU_ITEMS;

  return (
    <Sidebar
      className={`${state === 'collapsed' ? 'w-16' : 'w-40'} pr-2 transition-all duration-300`}
      collapsible='icon'
    >
      <SidebarContent className='pt-6'>
        <SidebarGroup>
          <SidebarGroupLabel
            className={`${state === 'collapsed' ? 'sr-only' : ''} text-xl font-semibold mb-4`}
          >
            메뉴
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className='space-y-2'>
              {menuItems.map((item, index) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`rounded-xl transition-all duration-300 hover:scale-105 ${
                      state === 'collapsed' ? 'flex justify-center' : ''
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <NavLink to={item.url} end className={getNavLinkClassName}>
                      <item.icon
                        className={`w-5 h-5 ${state === 'collapsed' ? '' : 'mr-3'}`}
                      />
                      {state !== 'collapsed' && (
                        <span className='font-medium text-base'>
                          {item.title}
                        </span>
                      )}
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
