import { PayrollManagement } from "@/modules/payroll/components/payroll-management";
import { Suspense } from "react";
import { DataTableLoading } from "@/components/data-table-loading";

export default function PayrollPage() {
  return (
    <Suspense fallback={<DataTableLoading title="Payroll Management" />}>
      <PayrollManagement />
    </Suspense>
  );
}
