'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

/* Icons SVG placehodlers */
function HomeIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function BrushIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <path d="M2 12a10 10 0 1 0 20 0 10 10 0 1 0-20 0z" />
      <path d="M12 2a10 10 0 0 1 10 10 10 10 0 0 1-10 10 10 10 0 0 1-10-10A10 10 0 0 1 12 2z" />
      <path d="M8 12a2 2 0 1 0 4 0 2 2 0 1 0-4 0z" />
    </svg>
  );
}

function QrIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function PhotoIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

const navGroups = [
  {
    title: 'Gestion',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: <HomeIcon /> },
      { label: 'Programme', href: '/programme', icon: <CalendarIcon /> },
      { label: 'Invités & Groupes', href: '/invites', icon: <UsersIcon /> },
      { label: 'Envois & RSVP', href: '/envois', icon: <MailIcon /> },
    ],
  },
  {
    title: 'Design',
    items: [
      { label: 'Studio', href: '/studio', icon: <BrushIcon /> },
      { label: 'QR Codes', href: '/qr', icon: <QrIcon /> },
    ],
  },
  {
    title: 'Souvenirs',
    items: [
      { label: 'Photos & Vidéos', href: '/photos', icon: <PhotoIcon /> },
      { label: "Livre d'or audio", href: '/audio', icon: <MicIcon /> },
    ],
  },
];

export const Sidebar = ({ className }: { className?: string }) => {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'flex w-[268px] shrink-0 flex-col overflow-hidden bg-brand-ink p-[22px_16px_18px]',
        className,
      )}
    >
      <div className="pl-2">
        <div className="font-serif text-[22px] font-medium leading-7 tracking-[3.4px] text-white">
          MYEVENT&apos;S
        </div>
        <div className="mt-[3px] text-[9px] font-medium uppercase tracking-[1.6px] text-neutral-400">
          Espace Organisateur
        </div>
      </div>

      <div className="mt-[18px] flex shrink-0 items-center gap-[10px] rounded-xl border border-[rgba(212,176,123,0.18)] bg-[rgba(255,255,255,0.05)] p-[10px]">
        <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border border-[rgba(212,176,123,0.5)] bg-primary text-[11px] font-medium text-accent">
          MM
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-medium leading-[18px] text-[#f3efe7]">
            Mariage de M & M
          </div>
          <div className="text-[11px] leading-[16px] text-neutral-400">
            12 Septembre 2026
          </div>
        </div>
      </div>

      <nav className="mt-4 flex min-h-0 flex-1 flex-col overflow-y-auto">
        {navGroups.map((group, i) => (
          <React.Fragment key={group.title}>
            {i > 0 && (
              <div className="mb-3 h-px shrink-0 bg-[rgba(255,255,255,0.08)]" />
            )}
            <div className="px-[10px] pb-[6px] pt-[13px] text-[9.5px] font-medium uppercase tracking-[1.5px] text-neutral-400">
              {group.title}
            </div>
            <div className="flex flex-col gap-1">
              {group.items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex h-[33px] items-center gap-[11px] rounded-[10px] border border-transparent px-[9px] text-[13px] text-neutral-400 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus-ring',
                      isActive
                        ? 'border-[rgba(212,176,123,0.28)] bg-[rgba(212,176,123,0.13)] text-[#f3efe7] [&>svg]:stroke-accent'
                        : 'hover:bg-[rgba(255,255,255,0.05)] hover:text-[#f3efe7]',
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </React.Fragment>
        ))}
      </nav>

      <div className="mt-1.5 flex shrink-0 items-center gap-[10px] rounded-xl bg-white/5 p-[9px]">
        <div className="h-[30px] w-[30px] shrink-0 rounded-full bg-neutral-700" />
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-medium leading-[18px] text-white">
            Jean Dupont
          </div>
          <div className="text-[11px] leading-[16px] text-neutral-300">
            Plan gratuit
          </div>
        </div>
      </div>
    </aside>
  );
};
