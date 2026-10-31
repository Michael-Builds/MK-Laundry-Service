import type { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute -top-24 right-[12%] h-64 w-64 rounded-full border border-teal/15" />
      <div className="pointer-events-none absolute -bottom-28 left-[8%] h-72 w-72 rounded-full border border-teal/10" />

      <div className="relative z-10 w-full max-w-[440px] rounded-3xl border border-line bg-white p-8">
        <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl border border-teal bg-teal text-lg font-bold text-white">
          MK
        </div>
        <h1 className="mt-5 font-display text-3xl leading-tight font-semibold text-ink">
          {title}
        </h1>
        <p className="mt-3 text-sm text-slate-500">{subtitle}</p>
        <div className="mt-8">{children}</div>
        {footer ? <div className="mt-6">{footer}</div> : null}
      </div>
    </div>
  );
}
