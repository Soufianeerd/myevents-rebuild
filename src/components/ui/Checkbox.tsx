'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';
import { useField } from './Field';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
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
      <input
        type="checkbox"
        id={field?.id || props.id}
        ref={ref}
        aria-invalid={isError ? 'true' : undefined}
        aria-describedby={ariaDescribedBy?.trim() || undefined}
        className={cn(
          "peer h-[18px] w-[18px] shrink-0 appearance-none rounded-[5px] border border-neutral-300 bg-white checked:border-primary checked:bg-primary checked:bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' width='12' height='12' stroke='%23fff' stroke-width='2.4' fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M10 3L4.5 8.5L2 6'/%3E%3C/svg%3E\")] checked:bg-center checked:bg-no-repeat focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          isError && 'border-[#C98B8B]',
          className,
        )}
        {...props}
      />
    );
  },
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
