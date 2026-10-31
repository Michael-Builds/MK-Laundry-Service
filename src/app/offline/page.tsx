"use client";

import { StatusPage } from "@/components/system/StatusPage";
import { Button } from "@/components/ui/Button";
import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <StatusPage
      code="Offline"
      title="No internet connection"
      description="MK Laundry needs a connection to keep working smoothly. Check your network, then try again."
      icon={<WifiOff className="h-6 w-6" />}
      actions={
        <Button onClick={() => window.location.reload()} fullWidth className="sm:w-auto">
          Try again
        </Button>
      }
    />
  );
}
