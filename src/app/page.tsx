"use client";

import { useSession } from "@/components/providers/SessionProvider";
import { ScreenLoader } from "@/components/ui/PageLoader";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { user, loading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? "/dashboard" : "/login");
  }, [loading, user, router]);

  return <ScreenLoader label="Starting MK Laundry..." />;
}
