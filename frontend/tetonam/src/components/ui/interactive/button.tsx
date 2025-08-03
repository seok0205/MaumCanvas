import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-medium ring-offset-background transition-all duration-300 active:scale-95 hover:scale-105 min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform-gpu',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-soft hover:shadow-medium hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground shadow-soft hover:shadow-medium hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-soft hover:shadow-medium hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-soft hover:shadow-medium hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        mint: 'bg-gradient-mint text-white shadow-soft hover:shadow-medium hover:bg-mint-dark',
        yellow:
          'bg-gradient-yellow text-white shadow-soft hover:shadow-medium hover:bg-yellow-dark',
        blue: 'bg-gradient-blue text-white shadow-soft hover:shadow-medium hover:bg-light-blue-dark',
        lilac:
          'bg-lilac text-white shadow-soft hover:shadow-medium hover:bg-lilac-dark',
        peach:
          'bg-peach text-white shadow-soft hover:shadow-medium hover:bg-peach-dark',
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
