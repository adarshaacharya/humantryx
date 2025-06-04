import { SuperAdminLayout } from "@/modules/superadmin/layout";
import type { ReactNode } from "react";

export default async function AdminBaseLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <SuperAdminLayout>{children}</SuperAdminLayout>;
}
