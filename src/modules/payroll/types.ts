import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/api/root";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type PayrollRecord = {
  id: string;
  employeeId: string;
  payrollMonth: string;
  baseSalary: string;
  bonuses: string | null;
  allowances: string | null;
  totalWorkingDays: number;
  unpaidLeaveDays: number | null;
  perDayRate: string;
  leaveDeduction: string | null;
  taxPercentage: string | null;
  taxDeduction: string | null;
  grossPay: string;
  totalDeductions: string;
  netPay: string;
  currency: string;
  paymentStatus: "pending" | "paid" | "cancelled";
  paymentDate: Date | null;
  paymentReference: string | null;
  generatedBy: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  employee?: {
    id: string;
    designation: string;
    userId: string | null;
    organizationId: string;
    status: string;
    user?: {
      id: string;
      name: string | null;
      email: string;
    } | null;
  } | null;
  generatedByEmployee?: {
    id: string;
    designation: string;
    user?: {
      id: string;
      name: string | null;
      email: string;
    } | null;
  } | null;
};

export type PayrollRecordWithEmployee = PayrollRecord & {
  employee: {
    id: string;
    designation: string;
    user: {
      id: string;
      name: string;
      email: string;
    } | null;
  } | null;
  generatedByEmployee: {
    id: string;
    designation: string;
    user: {
      id: string;
      name: string;
      email: string;
    } | null;
  } | null;
};

export type SalarySettings = RouterOutputs["payroll"]["getSalarySettings"];
export type EmployeeWithSalarySettings =
  RouterOutputs["payroll"]["getEmployeesWithSalarySettings"][0];

export type PayrollFilters = {
  employeeId?: string;
  payrollMonth?: string;
  year?: number;
  status?: "pending" | "paid" | "cancelled" | "all";
};

export type PayrollTableMeta = {
  onViewPayroll?: (record: PayrollRecord) => void;
  onUpdatePaymentStatus?: (record: PayrollRecord) => void;
  onGeneratePayslip?: (record: PayrollRecord) => void;
  onQuickDownload?: (record: PayrollRecord) => void;
  isLoading?: boolean;
  pendingActionId?: string;
  showEmployeeInfo?: boolean;
};

// Utility function to convert PayrollRecord to PayrollRecordWithEmployee
export const toPayrollRecordWithEmployee = (
  record: PayrollRecord,
): PayrollRecordWithEmployee => {
  return {
    ...record,
    employee: record.employee
      ? {
          id: record.employee.id,
          designation: record.employee.designation,
          organizationId: record.employee.organizationId || "",
          userId: record.employee.user?.id || "",
          status: record.employee.status || "active",
          user: record.employee.user
            ? {
                id: record.employee.user.id,
                name: record.employee.user.name || "",
                email: record.employee.user.email,
              }
            : null,
        }
      : null,
    generatedByEmployee: record.generatedByEmployee
      ? {
          id: record.generatedByEmployee.id,
          designation: record.generatedByEmployee.designation,
          user: record.generatedByEmployee.user
            ? {
                id: record.generatedByEmployee.user.id,
                name: record.generatedByEmployee.user.name || "",
                email: record.generatedByEmployee.user.email,
              }
            : null,
        }
      : null,
  };
};
