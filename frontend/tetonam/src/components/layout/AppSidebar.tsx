import { Button } from '@/components/ui/interactive/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/navigation/sidebar';
import { COUNSELOR_MENU_ITEMS, USER_MENU_ITEMS } from '@/constants/menu';
import { useAuthStore } from '@/stores/useAuthStore';
import { getNavLinkClassName } from '@/utils/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const AppSidebar = () => {
  const { user } = useAuthStore();
  const { state, toggleSidebar } = useSidebar();

  const menuItems = user?.roles.includes('USER')
    ? USER_MENU_ITEMS
    : COUNSELOR_MENU_ITEMS;

  return (
    <Sidebar className='pr-2 transition-all duration-300' collapsible='icon'>
      <SidebarContent className='pt-6'>
        <SidebarGroup>
          {/* 사이드바 토글 버튼 - 메뉴 아이템들과 같은 수직선상에 위치 */}
          <div className='mb-4 px-2 flex group-data-[collapsible=icon]:justify-center'>
            <Button
              variant='ghost'
              size='icon'
              onClick={toggleSidebar}
              className='h-8 w-8 text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105'
              aria-label={
                state === 'expanded' ? '사이드바 접기' : '사이드바 펼치기'
              }
            >
              {state === 'expanded' ? (
                <ChevronLeft className='h-4 w-4' />
              ) : (
                <ChevronRight className='h-4 w-4' />
              )}
            </Button>
          </div>

          {/* 시각적 구분을 위한 구분선 */}
          <SidebarSeparator className='mb-4' />

          <SidebarGroupLabel className='text-xl font-semibold mb-4 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:invisible transition-all duration-300'>
            메뉴
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className='space-y-2'>
              {menuItems.map((item, index) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className='rounded-xl transition-all duration-300 hover:scale-105'
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <NavLink to={item.url} end className={getNavLinkClassName}>
                      <item.icon className='w-5 h-5 flex-shrink-0' />
                      <span className='font-medium text-sm ml-3 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:invisible transition-all duration-300'>
                        {item.title}
                      </span>
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
