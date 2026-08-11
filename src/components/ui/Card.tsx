import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
  flat?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, padded, flat, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-white border border-neutral-200 rounded-lg',
          flat ? 'shadow-none' : 'shadow-sm',
          padded && 'p-5',
          className,
        )}
        {...props}
      />
    );
  },
);
Card.displayName = 'Card';

export { Card };
