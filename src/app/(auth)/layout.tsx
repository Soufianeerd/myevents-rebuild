import * as React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f9f7f2]">
      {/* Left Sidebar - Dark Theme */}
      <aside className="w-full lg:w-[600px] bg-neutral-900 text-white flex flex-col justify-between p-8 lg:p-12 shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-800/50 to-transparent pointer-events-none" />

        <div className="relative z-10 flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">
            MyEvent&apos;s
          </span>
        </div>

        <div className="relative z-10 mt-12 lg:mt-auto lg:mb-auto">
          <h1 className="text-4xl lg:text-5xl font-serif font-light text-white mb-6 leading-tight">
            L&apos;excellence à<br />
            chaque événement.
          </h1>
          <p className="text-lg text-neutral-300 max-w-md">
            Gérez vos invités, envoyez vos invitations et suivez les
            confirmations en toute simplicité.
          </p>
        </div>

        <div className="relative z-10 mt-12 lg:mt-0 flex gap-4 text-sm text-neutral-400">
          <span>&copy; {new Date().getFullYear()} MyEvent&apos;s</span>
          <a href="#" className="hover:text-white transition-colors">
            Mentions légales
          </a>
        </div>
      </aside>

      {/* Right Content - Ivory */}
      <main className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
