import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-medium ring-offset-background transition-all duration-150 ease-out active:scale-[0.98] active:duration-75 min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform-gpu will-change-transform',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:bg-primary/95 active:shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)] active:bg-primary/80',
        destructive:
          'bg-destructive text-destructive-foreground shadow-md hover:shadow-lg hover:bg-destructive/95 active:shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)] active:bg-destructive/80',
        outline:
          'border border-input bg-background shadow-md hover:shadow-lg hover:bg-accent hover:text-accent-foreground active:shadow-[inset_0_2px_8px_rgba(0,0,0,0.2)] active:bg-accent/70',
        secondary:
          'bg-secondary text-secondary-foreground shadow-md hover:shadow-lg hover:bg-secondary/85 active:shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)] active:bg-secondary/60',
        ghost:
          'hover:bg-accent hover:text-accent-foreground hover:shadow-md active:shadow-[inset_0_2px_8px_rgba(0,0,0,0.2)] active:bg-accent/70',
        link: 'text-primary underline-offset-4 hover:underline active:text-primary/70',
        mint: 'bg-gradient-mint text-white shadow-md hover:shadow-lg hover:bg-mint-dark active:shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)] active:bg-mint-dark/80',
        yellow:
          'bg-gradient-yellow text-white shadow-md hover:shadow-lg hover:bg-yellow-dark active:shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)] active:bg-yellow-dark/80',
        blue: 'bg-gradient-blue text-white shadow-md hover:shadow-lg hover:bg-light-blue-dark active:shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)] active:bg-light-blue-dark/80',
        lilac:
          'bg-lilac text-white shadow-md hover:shadow-lg hover:bg-lilac-dark active:shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)] active:bg-lilac-dark/80',
        peach:
          'bg-peach text-white shadow-md hover:shadow-lg hover:bg-peach-dark active:shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)] active:bg-peach-dark/80',
      },
      size: {
        default: 'h-12 px-6 py-3',
        sm: 'h-10 rounded-xl px-4 py-2',
        lg: 'h-14 rounded-2xl px-8 py-4 text-base',
        xl: 'h-16 rounded-2xl px-10 py-5 text-lg',
        icon: 'h-12 w-12 rounded-2xl',
        'icon-sm': 'h-10 w-10 rounded-xl',
        'icon-lg': 'h-14 w-14 rounded-2xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
