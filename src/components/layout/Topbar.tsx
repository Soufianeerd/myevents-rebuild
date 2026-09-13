'use client';

import * as React from 'react';
import { UserMenu } from './UserMenu';
import type { SafeUser } from '@/core/auth';

interface TopbarProps {
  onMenuClick: () => void;
  menuTriggerRef?: React.RefObject<HTMLButtonElement | null>;
  user: SafeUser;
}

export const Topbar = ({ onMenuClick, menuTriggerRef, user }: TopbarProps) => {
  return (
    <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-[16px] md:px-7">
      <div className="flex items-center gap-2">
        <button
          type="button"
          ref={menuTriggerRef}
          onClick={onMenuClick}
          className="mr-2 flex h-[36px] w-[36px] items-center justify-center rounded-md md:hidden hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          aria-label="Ouvrir le menu"
        >
          <MenuIcon />
        </button>
        {/* Breadcrumb or Title Placeholder */}
        <div className="hidden items-center gap-2 md:flex">
          <span className="text-xs text-neutral-500">Dashboard</span>
          <ChevronRightIcon className="h-[13px] w-[13px] stroke-neutral-400 stroke-[1.6px]" />
          <span className="text-xs font-medium text-neutral-900">
            Vue d&apos;ensemble
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Search */}
        <div className="hidden h-[36px] w-[272px] items-center gap-2 rounded-[10px] border border-neutral-200 bg-neutral-50 px-[11px] text-xs text-neutral-500 md:flex">
          <SearchIcon />
          <span>Rechercher...</span>
        </div>

        {/* Notifications */}
        <button
          type="button"
          className="relative flex h-[36px] w-[36px] items-center justify-center rounded-[10px] border border-neutral-200 bg-white hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          aria-label="Notifications"
        >
          <BellIcon />
          <span className="absolute right-1.5 top-1.5 h-[7px] w-[7px] rounded-full border-[1.5px] border-white bg-primary" />
        </button>

        {/* Vertical Divider */}
        <div className="mx-1 hidden h-6 w-px bg-neutral-200 md:block" />

        <UserMenu user={user} />
      </div>
    </header>
  );
};

const MenuIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const SearchIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const BellIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
