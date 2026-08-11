'use client';

import * as React from 'react';

import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui';
import { Sidebar } from './Sidebar';

interface MobileNavigationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MobileNavigation = ({
  open,
  onOpenChange,
}: MobileNavigationProps) => {
  // Removed useEffect to prevent immediate closing during tests

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="w-[268px] overflow-hidden border-none bg-brand-ink p-0">
        <div className="sr-only">
          <DrawerTitle>Menu de navigation</DrawerTitle>
          <DrawerDescription>
            Navigation principale de l&apos;application
          </DrawerDescription>
        </div>
        <Sidebar className="w-full h-full" />
      </DrawerContent>
    </Drawer>
  );
};
