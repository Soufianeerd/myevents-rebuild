'use client';

import * as React from 'react';
import { SkipLink } from './SkipLink';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNavigation } from './MobileNavigation';
import type { SafeUser } from '@/core/auth';

interface AppShellProps {
  children: React.ReactNode;
  user: SafeUser;
}

export const AppShell = ({ children, user }: AppShellProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const menuTriggerRef = React.useRef<HTMLButtonElement>(null);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <SkipLink />

      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex" />

      {/* Mobile Sidebar (Drawer) */}
      <MobileNavigation
        open={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
        returnFocusRef={menuTriggerRef}
      />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          onMenuClick={() => setIsMobileMenuOpen(true)}
          menuTriggerRef={menuTriggerRef}
          user={user}
        />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto outline-none p-[16px] md:p-7"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
