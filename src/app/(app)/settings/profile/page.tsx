"use client";

import {
  ChangePasswordForm,
  UpdateProfileForm,
} from "@/components/domain/ProfileForms";
import { Topbar } from "@/components/layout/Topbar";
import { useSession } from "@/components/providers/SessionProvider";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

export default function SettingsProfilePage() {
  const { user } = useSession();

  return (
    <div>
      <Topbar title="Profile" eyebrow="Account" />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-5">
        <div className="flex items-center gap-3">
          <Avatar name={user?.fullName || "Staff"} size="lg" />
          <div>
            <p className="text-lg font-semibold text-ink">{user?.fullName}</p>
            <p className="text-sm text-slate-500">{user?.email || user?.username}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="border border-teal/20 bg-teal-soft text-teal">
            {user?.role}
          </Badge>
          {user?.role === "Administrator" ? (
            <Link
              href="/settings"
              className="text-sm font-semibold text-teal hover:underline"
            >
              Business settings
            </Link>
          ) : null}
        </div>
      </div>

      <div className="grid w-full gap-5 xl:grid-cols-2">
        <UpdateProfileForm />
        <ChangePasswordForm />
      </div>
    </div>
  );
}
