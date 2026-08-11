import * as React from 'react';

export function ColorsShowcase() {
  const colors = [
    { label: 'Bordeaux 900', var: 'bg-[#4A121A]', text: 'text-white' },
    {
      label: 'Bordeaux 700 (Primary)',
      var: 'bg-primary',
      text: 'text-primary-foreground',
    },
    { label: 'Bordeaux 500', var: 'bg-[#9B3543]', text: 'text-white' },
    { label: 'Bordeaux 100', var: 'bg-[#F3E4E6]', text: 'text-primary' },
    { label: 'Gold 700', var: 'bg-[#876435]', text: 'text-white' },
    {
      label: 'Gold 500 (Accent)',
      var: 'bg-accent',
      text: 'text-accent-foreground',
    },
    { label: 'Gold 50', var: 'bg-[#FBF6EC]', text: 'text-[#876435]' },
    { label: 'Ink', var: 'bg-[#1C1614]', text: 'text-white' },
    { label: 'Ivory', var: 'bg-[#F9F7F2]', text: 'text-[#1C1614]' },
    { label: 'Success', var: 'bg-success', text: 'text-white' },
    { label: 'Warning', var: 'bg-warning', text: 'text-white' },
    { label: 'Danger', var: 'bg-danger', text: 'text-white' },
    { label: 'Info', var: 'bg-info', text: 'text-white' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="text-h3 border-b border-border pb-2">
        Couleurs & Tokens
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5">
        {colors.map((c) => (
          <div
            key={c.label}
            className="flex flex-col overflow-hidden rounded-lg border border-border"
          >
            <div
              className={`h-24 ${c.var} flex items-center justify-center ${c.text}`}
            >
              Aa
            </div>
            <div className="bg-white p-3 text-[12px] font-medium text-neutral-700">
              {c.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
