import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold';
  size?: 'default' | 'sm' | 'lg';
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'default',
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    // Classes from MyEvents-carrousel.html
    const baseClasses =
      'inline-flex items-center justify-center gap-2 rounded-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-neutral-100 disabled:text-neutral-400 whitespace-nowrap';

    const sizeClasses = {
      default: 'h-10 px-4 text-[14px]',
      sm: 'h-8 px-3 text-[13px]',
      lg: 'h-[46px] px-5 text-[15px]',
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
        disabled={disabled || loading}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';

export { Button };
