"use client";

import { BottomNav } from "./bottom-nav";
import { Sidebar } from "./sidebar";
import { MobileHeader } from "./mobile-header";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MobileHeader />
      <main className="md:ml-64 pb-20 md:pb-0">{children}</main>
      <BottomNav />
    </div>
  );
}