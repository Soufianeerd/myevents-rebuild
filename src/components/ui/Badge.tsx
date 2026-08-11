import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'premium';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'neutral', children, ...props }, ref) => {
    const variantClasses = {
      neutral: 'bg-neutral-100 text-neutral-600',
      primary: 'bg-brand-bordeaux-100 text-primary',
      success: 'bg-success-bg text-success',
      warning: 'bg-warning-bg text-warning',
      danger: 'bg-danger-bg text-danger',
      premium: 'bg-brand-gold-50 text-brand-gold-700',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-[9px] py-1 text-[11px] font-medium leading-[16px] whitespace-nowrap',
          variantClasses[variant],
          className,
        )}
        {...props}
      >
        <span className="block h-1.5 w-1.5 rounded-full bg-current flex-shrink-0" />
        {children}
      </div>
    );
  },
);
Badge.displayName = 'Badge';

export { Badge };
