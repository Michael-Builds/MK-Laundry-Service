import { Button } from "@/components/ui/Button";
import type { ReactNode } from "react";
import Link from "next/link";

export function StatusPage({
  code,
  title,
  description,
  icon,
  actions,
}: {
  code?: string;
  title: string;
  description: string;
  icon: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-line bg-white p-8 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-teal/20 bg-teal-soft text-teal">
          {icon}
        </div>
        {code ? (
          <p className="mb-2 text-sm font-bold tracking-[0.14em] text-teal uppercase">
            {code}
          </p>
        ) : null}
        <h1 className="font-display text-3xl font-semibold text-ink">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">{description}</p>
        {actions ? <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:justify-center">{actions}</div> : null}
      </div>
    </div>
  );
}

export function DefaultHomeActions() {
  return (
    <>
      <Link href="/dashboard">
        <Button>Go to dashboard</Button>
      </Link>
      <Link href="/login">
        <Button variant="secondary">Sign in</Button>
      </Link>
    </>
  );
}
