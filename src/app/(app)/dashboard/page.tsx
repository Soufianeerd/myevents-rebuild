import * as React from 'react';

export const metadata = {
  title: "Dashboard - MyEvent's",
};

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-start justify-between gap-6">
        <div>
          <h1 className="text-[26px] font-semibold leading-[34px] tracking-tight text-neutral-900">
            Bienvenue sur MyEvent&apos;s
          </h1>
          <p className="mt-1 text-[13px] text-neutral-500">
            Voici la structure de l&apos;application (Session 02). Les données
            sont factices.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-[18px_20px] shadow-sm">
          <div className="text-[11px] font-medium uppercase tracking-[1.6px] text-neutral-500">
            Invités Confirmés
          </div>
          <div className="mt-1 text-[32px] font-semibold leading-[40px] tracking-tight">
            142
          </div>
          <div className="mt-0.5 text-[12px] text-neutral-500">
            sur 150 invitations
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-[18px_20px] shadow-sm">
          <div className="text-[11px] font-medium uppercase tracking-[1.6px] text-neutral-500">
            Budget
          </div>
          <div className="mt-1 text-[32px] font-semibold leading-[40px] tracking-tight">
            12.5k€
          </div>
          <div className="mt-0.5 text-[12px] text-neutral-500">
            sur 15k€ prévus
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-[18px_20px] shadow-sm">
          <div className="text-[11px] font-medium uppercase tracking-[1.6px] text-neutral-500">
            Jours restants
          </div>
          <div className="mt-1 text-[32px] font-semibold leading-[40px] tracking-tight">
            214
          </div>
          <div className="mt-0.5 text-[12px] text-neutral-500">
            avant le grand jour
          </div>
        </div>
      </div>
    </div>
  );
}
