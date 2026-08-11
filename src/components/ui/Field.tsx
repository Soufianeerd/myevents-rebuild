'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

interface FieldContextValue {
  id: string;
  describedById: string;
  errorId: string;
  error?: boolean;
}

const FieldContext = React.createContext<FieldContextValue | null>(null);

export function useField() {
  return React.useContext(FieldContext);
}

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  error?: boolean;
}

const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ className, error, ...props }, ref) => {
    const id = React.useId();
    const describedById = `${id}-desc`;
    const errorId = `${id}-err`;

    return (
      <FieldContext.Provider value={{ id, describedById, errorId, error }}>
        <div
          ref={ref}
          className={cn('flex flex-col gap-1.5', className)}
          {...props}
        />
      </FieldContext.Provider>
    );
  },
);
Field.displayName = 'Field';

const FieldLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  const field = useField();
  return (
    <label
      ref={ref}
      htmlFor={field?.id}
      className={cn('text-[13px] font-medium text-neutral-700', className)}
      {...props}
    />
  );
});
FieldLabel.displayName = 'FieldLabel';

const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const field = useField();
  if (!field)
    return (
      <p
        ref={ref}
        className={cn('text-[11px] text-neutral-500', className)}
        {...props}
      />
    );
  return (
    <p
      ref={ref}
      id={field.describedById}
      className={cn('text-[11px] text-neutral-500', className)}
      {...props}
    />
  );
});
FieldDescription.displayName = 'FieldDescription';

const FieldError = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const field = useField();
  if (!field)
    return (
      <p
        ref={ref}
        className={cn('text-[11px] text-danger', className)}
        {...props}
      />
    );
  if (!field.error) return null;
  return (
    <p
      ref={ref}
      id={field.errorId}
      className={cn('text-[11px] text-danger', className)}
      {...props}
    />
  );
});
FieldError.displayName = 'FieldError';

export { Field, FieldLabel, FieldDescription, FieldError };
