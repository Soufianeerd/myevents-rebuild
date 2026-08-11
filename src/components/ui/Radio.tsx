'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';
import { useField } from './Field';

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
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
        type="radio"
        id={field?.id || props.id}
        ref={ref}
        aria-describedby={ariaDescribedBy?.trim() || undefined}
        className={cn(
          "peer h-[18px] w-[18px] shrink-0 appearance-none rounded-full border-[1.5px] border-neutral-300 bg-white checked:border-primary checked:bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 18 18'%3E%3Ccircle cx='9' cy='9' r='4' fill='%237A1F2B'/%3E%3C/svg%3E\")] checked:bg-center checked:bg-no-repeat focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          isError && 'border-[#C98B8B]',
          className,
        )}
        {...props}
      />
    );
  },
);
Radio.displayName = 'Radio';

export { Radio };
