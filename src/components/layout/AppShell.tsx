'use client';

import * as React from 'react';
import { SkipLink } from './SkipLink';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNavigation } from './MobileNavigation';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell = ({ children }: AppShellProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <SkipLink />

      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex" />

      {/* Mobile Sidebar (Drawer) */}
      <MobileNavigation
        open={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto outline-none p-4 md:p-7"
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
