import { Slot } from '@radix-ui/react-slot';
import clsx from 'clsx';
import { forwardRef } from 'react';
import type { ElementType } from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  asChild?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', children, asChild = false, ...props }, ref) => {
    const Component = (asChild ? Slot : 'button') as ElementType;

    return (
      <Component
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
          variant === 'primary' && 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500',
          variant === 'secondary' && 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-500',
          variant === 'ghost' && 'text-primary-600 hover:bg-primary-50 focus-visible:ring-primary-500',
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Button.displayName = 'Button';
