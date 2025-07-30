/**
 * NavLink의 className을 결정하는 함수
 * @param isActive - 현재 링크가 활성화되었는지 여부
 * @returns TailwindCSS 클래스명
 */
export const getNavLinkClassName = ({
  isActive,
}: {
  isActive: boolean;
}): string => {
  return isActive
    ? 'bg-primary/10 text-primary font-medium'
    : 'hover:bg-muted/50';
};
