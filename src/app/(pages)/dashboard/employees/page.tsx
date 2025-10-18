import { Suspense } from "react";
import { EmployeeManagement } from "@/modules/employees/components/employee/employee-management";
import { Spinner } from "@/components/spinner";

export default function EmployeesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-200px)] items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <EmployeeManagement />
    </Suspense>
  );
}
