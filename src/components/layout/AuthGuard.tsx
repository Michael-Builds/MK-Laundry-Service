"use client";

import { canAccessRoute } from "@/data/session";
import { useSession } from "@/components/providers/SessionProvider";
import { ScreenLoader } from "@/components/ui/PageLoader";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!canAccessRoute(user.role, pathname)) {
      router.replace("/dashboard");
    }
  }, [loading, user, pathname, router]);

  if (loading || !user) {
    return <ScreenLoader label="Checking session..." />;
  }

  if (!canAccessRoute(user.role, pathname)) {
    return <ScreenLoader label="Redirecting..." />;
  }

  return <>{children}</>;
}
