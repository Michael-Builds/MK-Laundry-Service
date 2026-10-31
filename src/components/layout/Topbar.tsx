"use client";

import { useSession } from "@/components/providers/SessionProvider";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { LogOut, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useNav } from "./NavContext";

export function Topbar({
  title,
  eyebrow = "Overview",
}: {
  title: string;
  eyebrow?: string;
}) {
  const { logout } = useSession();
  const { openNav } = useNav();
  const router = useRouter();
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  const handleSignOut = () => {
    setConfirmSignOut(false);
    logout();
    router.replace("/login");
  };

  return (
    <>
      <header className="no-print mb-6 flex flex-wrap items-end justify-between gap-3 sm:mb-8 sm:gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <button
            type="button"
            aria-label="Open navigation"
            className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line bg-white text-ink md:hidden"
            onClick={openNav}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <p className="mb-1 text-[11px] font-bold tracking-[0.14em] text-teal uppercase">
              {eyebrow}
            </p>
            <h1 className="font-display truncate text-2xl text-ink sm:text-3xl">
              {title}
            </h1>
          </div>
        </div>
        <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
          <p className="hidden text-sm text-slate-500 sm:block">
            {new Date().toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <Button
            variant="secondary"
            size="sm"
            icon={<LogOut className="h-4 w-4" />}
            onClick={() => setConfirmSignOut(true)}
          >
            Sign out
          </Button>
        </div>
      </header>

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
