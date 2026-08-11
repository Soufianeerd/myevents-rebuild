'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';
import { useField } from './Field';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
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
      <textarea
        id={field?.id || props.id}
        ref={ref}
        aria-invalid={isError ? 'true' : undefined}
        aria-describedby={ariaDescribedBy?.trim() || undefined}
        className={cn(
          'flex min-h-[86px] w-full rounded-[10px] border border-neutral-300 bg-white px-[13px] py-3 text-[14px] text-neutral-900 transition-colors placeholder:text-neutral-400 focus-visible:outline-none focus-visible:border-accent focus-visible:ring-[3px] focus-visible:ring-accent/20 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400',
          isError && 'border-[#C98B8B]',
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };
