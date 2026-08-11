import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rectangular' | 'circular';
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'rectangular', ...props }, ref) => {
    const variantClasses = {
      text: 'h-3 w-full rounded-[4px]',
      rectangular: 'h-full w-full rounded-md',
      circular: 'rounded-full',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'animate-pulse bg-gradient-to-r from-neutral-100 via-neutral-50 to-neutral-100 motion-reduce:animate-none',
          variantClasses[variant],
          className,
        )}
        {...props}
      />
    );
  },
);
Skeleton.displayName = 'Skeleton';

export { Skeleton };
