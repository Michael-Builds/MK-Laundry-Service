"use client";

import { StatusPage } from "@/components/system/StatusPage";
import { Button } from "@/components/ui/Button";
import { WifiOff } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const sync = () => setOnline(window.navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  if (!online) {
    return (
      <StatusPage
        code="Offline"
        title="No internet connection"
        description="You’re offline right now. Reconnect to continue using the MK Laundry staff console."
        icon={<WifiOff className="h-6 w-6" />}
        actions={
          <Button onClick={() => window.location.reload()} fullWidth className="sm:w-auto">
            Try again
          </Button>
        }
      />
    );
  }

  return <>{children}</>;
}
