"use client";

import type { ReactNode } from "react";
import { NavProvider } from "./NavContext";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <NavProvider>
      <div className="min-h-screen">
        <Sidebar />
        <main className="min-h-screen px-4 py-6 sm:px-6 md:ml-[248px] md:px-8 lg:px-10 lg:py-8">
          {children}
        </main>
      </div>
    </NavProvider>
  );
}
