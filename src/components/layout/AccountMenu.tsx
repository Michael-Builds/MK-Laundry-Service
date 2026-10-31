"use client";

import { useSession } from "@/components/providers/SessionProvider";
import { Avatar } from "@/components/ui/Avatar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/cn";
import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function AccountMenu() {
  const { user, logout } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!user) return null;

  const handleSignOut = () => {
    setConfirmSignOut(false);
    setOpen(false);
    logout();
    router.replace("/login");
  };

  return (
    <>
      <div ref={rootRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="inline-flex max-w-full items-center gap-2 rounded-xl border border-line bg-white px-2.5 py-1.5 transition hover:border-line-strong"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <Avatar name={user.fullName} size="sm" />
          <span className="hidden min-w-0 text-left sm:block">
            <span className="block max-w-[140px] truncate text-sm font-semibold text-ink">
              {user.fullName}
            </span>
            <span className="block max-w-[140px] truncate text-[11px] text-slate-500">
              {user.role}
            </span>
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-slate-400 transition",
              open && "rotate-180",
            )}
          />
        </button>

        {open ? (
          <div
            role="menu"
            className="absolute top-[calc(100%+8px)] right-0 z-50 w-56 overflow-hidden rounded-xl border border-line bg-white p-1"
          >
            <div className="border-b border-line px-3 py-2.5 sm:hidden">
              <p className="truncate text-sm font-semibold text-ink">{user.fullName}</p>
              <p className="truncate text-xs text-slate-500">{user.role}</p>
            </div>
            <Link
              href="/settings/profile"
              role="menuitem"
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-mist"
              onClick={() => setOpen(false)}
            >
              <UserRound className="h-4 w-4 text-slate-500" />
              Profile
            </Link>
            {user.role === "Administrator" ? (
              <Link
                href="/settings"
                role="menuitem"
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-ink transition hover:bg-mist"
                onClick={() => setOpen(false)}
              >
                <Settings className="h-4 w-4 text-slate-500" />
                Settings
              </Link>
            ) : null}
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--danger)] transition hover:bg-[#fef3f2]"
              onClick={() => {
                setOpen(false);
                setConfirmSignOut(true);
              }}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirmSignOut}
        onClose={() => setConfirmSignOut(false)}
        onConfirm={handleSignOut}
        title="Sign out?"
        description="You will need to sign in again to access the staff console."
        confirmLabel="Sign out"
        cancelLabel="Stay signed in"
        tone="danger"
      />
    </>
  );
}
