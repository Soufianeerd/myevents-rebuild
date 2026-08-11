import * as React from 'react';
import { cn } from '@/lib/utils/cn';
import { ButtonProps } from './Button';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonProps['variant'];
  size?: 'default' | 'sm' | 'lg';
  'aria-label': string; // required
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'default',
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center rounded-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-neutral-100 disabled:text-neutral-400';

    const sizeClasses = {
      default: 'h-10 w-10',
      sm: 'h-8 w-8',
      lg: 'h-[46px] w-[46px]',
    };

    const variantClasses = {
      primary:
        'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active border border-transparent',
      gold: 'bg-accent text-accent-foreground hover:bg-accent-hover border border-transparent',
      secondary:
        'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50',
      outline:
        'bg-transparent border border-border text-foreground hover:bg-surface-muted',
      ghost: 'bg-transparent text-neutral-600 hover:bg-neutral-50',
      danger: 'bg-white border border-[#E3C4C4] text-danger hover:bg-danger-bg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
IconButton.displayName = 'IconButton';

export { IconButton };
