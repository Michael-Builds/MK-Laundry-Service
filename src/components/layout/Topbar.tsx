"use client";

import { useSession } from "@/components/providers/SessionProvider";
import { Button } from "@/components/ui/Button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function Topbar({
  title,
  eyebrow = "Overview",
}: {
  title: string;
  eyebrow?: string;
}) {
  const { logout } = useSession();
  const router = useRouter();

  return (
    <header className="no-print mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="mb-1 text-[11px] font-bold tracking-[0.14em] text-teal uppercase">
          {eyebrow}
        </p>
        <h1 className="font-display text-3xl text-ink">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <p className="text-sm text-slate-500">
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
          onClick={() => {
            logout();
            router.replace("/login");
          }}
        >
          Sign out
        </Button>
      </div>
    </header>
  );
}
