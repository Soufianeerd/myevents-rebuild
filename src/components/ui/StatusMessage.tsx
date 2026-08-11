import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface StatusMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  icon?: React.ReactNode;
}

const StatusMessage = React.forwardRef<HTMLDivElement, StatusMessageProps>(
  ({ className, variant = 'info', icon, children, ...props }, ref) => {
    const variantClasses = {
      info: 'text-info',
      success: 'text-success',
      warning: 'text-warning',
      danger: 'text-danger',
    };

    return (
      <div
        ref={ref}
        role="status"
        className={cn(
          'flex items-center gap-2 text-[13px] font-medium',
          variantClasses[variant],
          className,
        )}
        {...props}
      >
        {icon && (
          <div className="flex-shrink-0 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:stroke-current [&>svg]:stroke-[1.6px]">
            {icon}
          </div>
        )}
        {children}
      </div>
    );
  },
);
StatusMessage.displayName = 'StatusMessage';

export { StatusMessage };
