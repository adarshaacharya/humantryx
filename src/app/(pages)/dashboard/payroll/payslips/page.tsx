import { EmployeeSalaryView } from "@/modules/payroll/components/employee-salary-view";
import { Suspense } from "react";
import { DataTableLoading } from "@/components/data-table-loading";

export default function PayslipsPage() {
  return (
    <Suspense fallback={<DataTableLoading title="Payslips" />}>
      <EmployeeSalaryView />
    </Suspense>
  );
}
