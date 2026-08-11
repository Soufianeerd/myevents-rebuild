import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface AlertProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'title'
> {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: React.ReactNode;
  icon?: React.ReactNode;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'info', title, icon, children, ...props }, ref) => {
    const variantClasses = {
      info: 'bg-info-bg text-info',
      success: 'bg-success-bg text-success',
      warning: 'bg-warning-bg text-warning',
      danger: 'bg-danger-bg text-danger',
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          'flex gap-3 rounded-xl p-[14px] px-4',
          variantClasses[variant],
          className,
        )}
        {...props}
      >
        {icon && (
          <div className="flex-shrink-0 [&>svg]:h-[18px] [&>svg]:w-[18px] [&>svg]:stroke-current [&>svg]:stroke-[1.6px]">
            {icon}
          </div>
        )}
        <div className="flex flex-col flex-1">
          {title && <div className="text-[14px] font-medium">{title}</div>}
          {children && (
            <div
              className={cn(
                'text-[12px] font-normal',
                title ? 'mt-[3px] text-neutral-600' : '',
              )}
            >
              {children}
            </div>
          )}
        </div>
      </div>
    );
  },
);
Alert.displayName = 'Alert';

export { Alert };
