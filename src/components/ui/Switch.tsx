'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';
import { useField } from './Field';

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, error, ...props }, ref) => {
    const field = useField();
    const isError = error || field?.error;

    let ariaDescribedBy = props['aria-describedby'];
    if (field) {
      ariaDescribedBy = ariaDescribedBy
        ? `${ariaDescribedBy} ${field.describedById} ${isError ? field.errorId : ''}`
        : `${field.describedById} ${isError ? field.errorId : ''}`;
    }

    return (
      <div
        className={cn(
          'relative inline-flex h-[23px] w-[40px] shrink-0 cursor-pointer items-center',
          className,
        )}
      >
        <input
          type="checkbox"
          role="switch"
          id={field?.id || props.id}
          ref={ref}
          aria-invalid={isError ? 'true' : undefined}
          aria-describedby={ariaDescribedBy?.trim() || undefined}
          className="peer sr-only"
          {...props}
        />
        <div
          className={cn(
            'h-[23px] w-[40px] rounded-full bg-neutral-300 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-focus-ring peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 peer-checked:bg-primary',
            isError && 'ring-2 ring-danger/50',
          )}
        />
        <div className="absolute left-[3px] top-[3px] h-[17px] w-[17px] rounded-full bg-white transition-transform peer-checked:translate-x-[17px]" />
      </div>
    );
  },
);
Switch.displayName = 'Switch';

export { Switch };
