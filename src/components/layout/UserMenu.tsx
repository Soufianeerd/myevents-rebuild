'use client';

import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui';
import type { SafeUser } from '@/core/auth';
import { logoutAction } from '@/app/(auth)/actions';

interface UserMenuProps {
  user: SafeUser;
}

export const UserMenu = ({ user }: UserMenuProps) => {
  const [isPending, startTransition] = React.useTransition();
  const initials = user.displayName.substring(0, 2).toUpperCase();

  const handleLogout = () => {
    startTransition(() => {
      logoutAction();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
          aria-label="Menu utilisateur"
        >
          <span className="text-xs font-medium text-white">{initials}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-neutral-900 truncate">
            {user.displayName}
          </p>
          <p className="text-xs text-neutral-500 truncate">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profil</DropdownMenuItem>
        <DropdownMenuItem>Facturation</DropdownMenuItem>
        <DropdownMenuItem>Équipe</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-danger focus:text-danger focus:bg-danger-bg"
          onClick={handleLogout}
          disabled={isPending}
        >
          {isPending ? 'Déconnexion...' : 'Déconnexion'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
