interface PenIconProps {
  className?: string;
  size?: number;
}

export const PenIcon = ({ className = '', size = 24 }: PenIconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={className}
    >
      <path
        d='M21.731 2.269a2.5 2.5 0 0 0-3.536 0l-1.225 1.225-1.768-1.768a1 1 0 0 0-1.414 0l-11 11A1 1 0 0 0 2.5 13.414l0 6.586a1 1 0 0 0 1 1h6.586a1 1 0 0 0 .707-.293l11-11a1 1 0 0 0 0-1.414l-1.768-1.768 1.225-1.225a2.5 2.5 0 0 0 0-3.536ZM19.5 4.5l-15 15H4v-0.5l15-15Z'
        fill='currentColor'
      />
      <path
        d='M18.5 6.5 17 8l-1-1 1.5-1.5a0.5 0.5 0 0 1 0.707 0L18.5 5.793a0.5 0.5 0 0 1 0 0.707Z'
        fill='currentColor'
      />
    </svg>
  );
};
