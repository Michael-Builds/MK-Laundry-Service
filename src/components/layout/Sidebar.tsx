"use client";

import { navItemsForRole } from "@/data/session";
import { useSession } from "@/components/providers/SessionProvider";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";
import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  Settings,
  Shirt,
  UserRound,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useNav } from "./NavContext";

const icons = {
  "/dashboard": LayoutDashboard,
  "/orders": ClipboardList,
  "/services": Shirt,
  "/employees": Users,
  "/reports": BarChart3,
  "/settings/profile": UserRound,
  "/settings": Settings,
} as const;

export function Sidebar() {
  const { user } = useSession();
  const pathname = usePathname();
  const { open, closeNav } = useNav();

  useEffect(() => {
    closeNav();
  }, [pathname, closeNav]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!user) return null;

  const items = navItemsForRole(user.role);

  return (
    <>
      <button
        type="button"
        aria-label="Close navigation"
        className={cn(
          "no-print fixed inset-0 z-40 bg-ink/40 transition md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={closeNav}
      />

      <aside
        className={cn(
          "no-print fixed inset-y-0 left-0 z-50 flex w-[min(248px,88vw)] flex-col bg-ink px-3 py-6 text-slate-300 transition-transform duration-200 md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="mb-7 flex items-center justify-between gap-3 px-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal text-sm font-bold text-white">
              MK
            </span>
            <div>
              <p className="font-display text-[17px] leading-tight font-semibold text-white">
                MK Laundry
              </p>
              <p className="text-[11px] text-slate-400">Staff console</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white md:hidden"
            onClick={closeNav}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <Link
          href="/settings/profile"
          onClick={closeNav}
          className="mb-6 flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3 transition hover:bg-white/10"
        >
          <Avatar name={user.fullName} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {user.fullName}
            </p>
            <p className="truncate text-xs text-slate-400">{user.role}</p>
          </div>
        </Link>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {items.map((item) => {
            const Icon = icons[item.href as keyof typeof icons] ?? ClipboardList;
            const active =
              pathname === item.href ||
              (item.href === "/settings" && pathname === "/settings") ||
              (item.href === "/settings/profile" &&
                pathname.startsWith("/settings/profile")) ||
              (item.href !== "/orders/new" &&
                item.href === "/orders" &&
                pathname.startsWith("/orders/"));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeNav}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white",
                )}
              >
                <span
                  className={cn(
                    "absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-full bg-teal transition-opacity",
                    active ? "opacity-100" : "opacity-0",
                  )}
                />
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
