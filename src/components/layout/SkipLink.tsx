import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export const SkipLink = () => {
  return (
    <a
      href="#main-content"
      className={cn(
        'sr-only focus:not-sr-only',
        'fixed left-4 top-4 z-50',
        'rounded-md bg-white px-4 py-2 font-medium text-primary shadow-md ring-2 ring-focus-ring outline-none',
      )}
    >
      Aller au contenu principal
    </a>
  );
};
