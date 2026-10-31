import { AuthGuard } from "@/components/layout/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import type { ReactNode } from "react";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen">
        <Sidebar />
        <main className="min-h-screen px-5 py-8 md:ml-[248px] md:px-10">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
