import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center text-center p-8',
          className,
        )}
        {...props}
      >
        {icon && (
          <div className="mb-4 text-neutral-400 [&>svg]:h-12 [&>svg]:w-12 [&>svg]:stroke-current [&>svg]:stroke-[1.6px]">
            {icon}
          </div>
        )}
        <h3 className="text-[18px] font-semibold tracking-[-0.2px] text-neutral-900 mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-[14px] text-neutral-600 max-w-sm mb-6">
            {description}
          </p>
        )}
        {action && <div>{action}</div>}
      </div>
    );
  },
);
EmptyState.displayName = 'EmptyState';

export { EmptyState };
