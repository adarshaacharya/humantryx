import { DashboardSideBar } from "@/modules/dashboard/side-bar";
import { DashboardTopNav } from "@/modules/dashboard/top-bar";
import { SidebarProvider } from "@/components/ui/sidebar";
import type { ReactNode } from "react";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <DashboardSideBar />
        <main className="flex-1 overflow-y-auto">
          <DashboardTopNav>{children}</DashboardTopNav>
        </main>
      </div>
    </SidebarProvider>
  );
}
