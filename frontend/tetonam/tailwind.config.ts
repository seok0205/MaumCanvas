import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        sans: [
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'Apple SD Gothic Neo',
          'Noto Sans KR',
          'Malgun Gothic',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          light: 'hsl(var(--primary-light))',
          dark: 'hsl(var(--primary-dark))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        // 청소년 친화적 컬러 팔레트
        mint: {
          DEFAULT: 'hsl(var(--mint))',
          light: 'hsl(var(--mint-light))',
          dark: 'hsl(var(--mint-dark))',
        },
        yellow: {
          DEFAULT: 'hsl(var(--yellow))',
          light: 'hsl(var(--yellow-light))',
          dark: 'hsl(var(--yellow-dark))',
        },
        'light-blue': {
          DEFAULT: 'hsl(var(--light-blue))',
          light: 'hsl(var(--light-blue-light))',
          dark: 'hsl(var(--light-blue-dark))',
        },
        lilac: {
          DEFAULT: 'hsl(var(--lilac))',
          light: 'hsl(var(--lilac-light))',
          dark: 'hsl(var(--lilac-dark))',
        },
        peach: {
          DEFAULT: 'hsl(var(--peach))',
          light: 'hsl(var(--peach-light))',
          dark: 'hsl(var(--peach-dark))',
        },
      },
      backgroundImage: {
        'gradient-warm': 'var(--gradient-warm)',
        // 'gradient-primary': 'var(--gradient-primary)', // 미사용
        // 'gradient-subtle': 'var(--gradient-subtle)', // 미사용
        'gradient-mint': 'var(--gradient-mint)',
        'gradient-yellow': 'var(--gradient-yellow)',
        'gradient-blue': 'var(--gradient-blue)',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        medium: 'var(--shadow-medium)',
        card: 'var(--shadow-card)',
        hover: 'var(--shadow-hover)',
        // youth: 'var(--shadow-soft)', // 중복 (soft와 동일)
        // 'youth-hover': 'var(--shadow-hover)', // 중복 (hover와 동일)
      },
      // 전환 함수들 - 현재 미사용
      // transitionTimingFunction: {
      //   smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      //   bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      //   spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      // },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'var(--radius-lg)',
        '2xl': 'var(--radius-xl)',
      },
      keyframes: {
        // Accordion 애니메이션 - 현재 미사용 (Radix UI 설치되어 있지만 사용 안함)
        // 'accordion-down': {
        //   from: {
        //     height: '0',
        //   },
        //   to: {
        //     height: 'var(--radix-accordion-content-height)',
        //   },
        // },
        // 'accordion-up': {
        //   from: {
        //     height: 'var(--radix-accordion-content-height)',
        //   },
        //   to: {
        //     height: '0',
        //   },
        // },
        'fade-in': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        // 슬라이드 애니메이션들 - 현재 미사용
        // 'slide-in-right': {
        //   '0%': { transform: 'translateX(100%)' },
        //   '100%': { transform: 'translateX(0)' },
        // },
        // 'slide-in-left': {
        //   '0%': { transform: 'translateX(-100%)' },
        //   '100%': { transform: 'translateX(0)' },
        // },
        // 'scale-in': {
        //   '0%': {
        //     transform: 'scale(0.95)',
        //     opacity: '0',
        //   },
        //   '100%': {
        //     transform: 'scale(1)',
        //     opacity: '1',
        //   },
        // },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'bounce-gentle': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        'scale-gentle': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'pulse-gentle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
      animation: {
        // Accordion 애니메이션 - 현재 미사용
        // 'accordion-down': 'accordion-down 0.2s ease-out',
        // 'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        // 슬라이드 애니메이션들 - 현재 미사용
        // 'slide-in-right': 'slide-in-right 0.3s ease-out',
        // 'slide-in-left': 'slide-in-left 0.3s ease-out',
        // 'scale-in': 'scale-in 0.3s ease-out',
        float: 'float 3s ease-in-out infinite',
        'bounce-gentle': 'bounce-gentle 0.6s ease-out',
        'scale-gentle': 'scale-gentle 0.3s ease-out',
        'pulse-gentle': 'pulse-gentle 2s ease-in-out infinite',
        wiggle: 'wiggle 1s ease-in-out infinite',
      },
      // 커스텀 간격 - 현재 미사용
      // spacing: {
      //   '18': '4.5rem',
      //   '88': '22rem',
      //   '128': '32rem',
      // },
      // 최소 높이 - 현재 미사용
      // minHeight: {
      //   '44': '44px',
      //   '56': '56px',
      // },
      // 최소 너비 - 현재 미사용
      // minWidth: {
      //   '44': '44px',
      //   '56': '56px',
      // },
    },
  },
  plugins: [tailwindcssAnimate, typography],
} satisfies Config;
