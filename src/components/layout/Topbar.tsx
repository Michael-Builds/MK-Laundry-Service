"use client";

import { Bell, Menu } from "lucide-react";
import type { ReactNode } from "react";
import { AccountMenu } from "./AccountMenu";
import { useNav } from "./NavContext";

export function Topbar({
  title,
  eyebrow = "Overview",
  actions,
}: {
  title: string;
  eyebrow?: string;
  actions?: ReactNode;
}) {
  const { openNav } = useNav();

  return (
    <header className="no-print sticky top-0 z-30 -mx-4 mb-6 border-b border-line bg-white px-4 py-3.5 sm:-mx-6 sm:mb-8 sm:px-6 sm:py-4 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            aria-label="Open navigation"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line bg-white text-ink md:hidden"
            onClick={openNav}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <p className="mb-0.5 text-[11px] font-bold tracking-[0.14em] text-teal uppercase">
              {eyebrow}
            </p>
            <h1 className="font-display truncate text-xl text-ink sm:text-2xl">
              {title}
            </h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          {actions}
          <p className="hidden text-sm text-slate-500 lg:block">
            {new Date().toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <button
            type="button"
            aria-label="Notifications"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-white text-ink transition hover:border-line-strong"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span
              aria-hidden
              className="notify-blink absolute top-2 right-2 h-2 w-2 rounded-full bg-[var(--danger)]"
            />
          </button>
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
