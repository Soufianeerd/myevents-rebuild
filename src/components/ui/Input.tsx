'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';
import { useField } from './Field';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    const field = useField();
    const isError = error || field?.error;

    // Combining ARIA describedby if both exist
    let ariaDescribedBy = props['aria-describedby'];
    if (field) {
      ariaDescribedBy = ariaDescribedBy
        ? `${ariaDescribedBy} ${field.describedById} ${isError ? field.errorId : ''}`
        : `${field.describedById} ${isError ? field.errorId : ''}`;
    }

    return (
      <input
        type={type}
        id={field?.id || props.id}
        ref={ref}
        aria-invalid={isError ? 'true' : undefined}
        aria-describedby={ariaDescribedBy?.trim() || undefined}
        className={cn(
          'flex h-[42px] w-full rounded-[10px] border border-neutral-300 bg-white px-[13px] py-2 text-[14px] text-neutral-900 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:outline-none focus-visible:border-accent focus-visible:ring-[3px] focus-visible:ring-accent/20 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400',
          isError && 'border-[#C98B8B]',
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
