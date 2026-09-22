'use client';

import * as React from 'react';

import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui';
import type { SafeUser } from '@/core/auth';
import { Sidebar } from './Sidebar';

interface MobileNavigationProps {
  user?: SafeUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
}

export const MobileNavigation = ({
  user,
  open,
  onOpenChange,
  returnFocusRef,
}: MobileNavigationProps) => {
  // Removed useEffect to prevent immediate closing during tests

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className="w-[268px] overflow-hidden border-none bg-brand-ink p-0"
        onCloseAutoFocus={(e) => {
          if (returnFocusRef?.current) {
            e.preventDefault();
            returnFocusRef.current.focus();
          }
        }}
      >
        <div className="sr-only">
          <DrawerTitle>Menu de navigation</DrawerTitle>
          <DrawerDescription>
            Navigation principale de l&apos;application
          </DrawerDescription>
        </div>
        <Sidebar user={user} className="w-full h-full" />
      </DrawerContent>
    </Drawer>
  );
};
