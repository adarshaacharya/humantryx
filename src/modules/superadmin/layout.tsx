"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { SuperAdminSidebar } from "./components/sidebar";
import { SuperAdminTopNav } from "./components/top-nav";

export function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <SuperAdminSidebar />
        <main className="flex-1">
          <SuperAdminTopNav>{children}</SuperAdminTopNav>
        </main>
      </div>
    </SidebarProvider>
  );
}
