"use client";

import { useState, useCallback } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Calculator, DollarSign, Users } from "lucide-react";
import { authClient } from "@/server/auth/auth-client";
import { useAbility } from "@/providers/ability-context";

import { payrollColumns } from "./payroll-table-columns";
import { SetSalaryDialog } from "./set-salary-dialog";
import { GeneratePayrollDialog } from "./generate-payroll-dialog";
import { UpdatePaymentStatusDialog } from "./update-payment-status-dialog";
import { PayrollFilters } from "./payroll-filters";
import { PayslipPreviewDialog } from "./payslip-preview-dialog";
import { usePayslipGenerator } from "../hooks/use-payslip-generator";

import type {
  PayrollRecord,
  PayrollFilters as IPayrollFilters,
} from "../types";
import { toPayrollRecordWithEmployee } from "../types";
import { PAYROLL_FEATURES } from "../constants";

const DEFAULT_FILTERS: IPayrollFilters = {
  status: "all",
  year: 2025,
};

export function PayrollManagement() {
  const [filters, setFilters] = useState<IPayrollFilters>(DEFAULT_FILTERS);
  const [setSalaryDialogOpen, setSetsalaryDialogOpen] = useState(false);
  const [generatePayrollDialogOpen, setGeneratePayrollDialogOpen] =
    useState(false);
  const [updatePaymentDialogOpen, setUpdatePaymentDialogOpen] = useState(false);
  const [payslipPreviewOpen, setPayslipPreviewOpen] = useState(false);
  const [selectedPayrollRecord, setSelectedPayrollRecord] =
    useState<PayrollRecord | null>(null);
  const [pendingActionId] = useState<string | undefined>();

  const { data: session } = authClient.useSession();
  const organizationId = session?.session?.activeOrganizationId;
  const ability = useAbility();
  const { generatePayslip } = usePayslipGenerator();

  const payrollRecordsQuery = api.payroll.getPayrollRecords.useQuery(
    {
      employeeId: filters.employeeId,
      payrollMonth: filters.payrollMonth,
      year: filters.year,
    },
    {
      enabled: !!organizationId,
    },
  );

  // Fetch employees with salary settings for stats
  const employeesWithSalariesQuery =
    api.payroll.getEmployeesWithSalarySettings.useQuery(undefined, {
      enabled: !!organizationId,
    });

  // Event handlers
  const handleFiltersChange = useCallback((newFilters: IPayrollFilters) => {
    setFilters(newFilters);
  }, []);

  const handleRefresh = useCallback(() => {
    void payrollRecordsQuery.refetch();
    void employeesWithSalariesQuery.refetch();
  }, [payrollRecordsQuery, employeesWithSalariesQuery]);

  const handleViewPayroll = useCallback((record: PayrollRecord) => {
    // TODO: Implement payroll detail view
    console.log("View payroll:", record);
  }, []);

  const handleUpdatePaymentStatus = useCallback((record: PayrollRecord) => {
    setSelectedPayrollRecord(record);
    setUpdatePaymentDialogOpen(true);
  }, []);

  const handleGeneratePayslip = useCallback((record: PayrollRecord) => {
    setSelectedPayrollRecord(record);
    setPayslipPreviewOpen(true);
  }, []);

  const handleQuickDownload = useCallback(
    (record: PayrollRecord) => {
      // Quick download without preview
      const payrollRecordWithEmployee = toPayrollRecordWithEmployee(record);
      generatePayslip(payrollRecordWithEmployee);
    },
    [generatePayslip],
  );

  const handleDialogSuccess = useCallback(() => {
    void payrollRecordsQuery.refetch();
    void employeesWithSalariesQuery.refetch();
  }, [payrollRecordsQuery, employeesWithSalariesQuery]);

  if (!organizationId) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="space-y-2 text-center">
            <AlertCircle className="text-muted-foreground mx-auto h-8 w-8" />
            <p className="text-muted-foreground">No organization selected</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (payrollRecordsQuery.error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="space-y-4 text-center">
            <AlertCircle className="text-destructive mx-auto h-8 w-8" />
            <div>
              <p className="text-destructive font-medium">
                Error loading payroll records
              </p>
              <p className="text-muted-foreground text-sm">
                {payrollRecordsQuery.error.message}
              </p>
            </div>
            <Button variant="outline" onClick={handleRefresh}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const payrollRecords = payrollRecordsQuery.data ?? [];
  const employees = employeesWithSalariesQuery.data ?? [];

  // Get employees with salary settings (they have salarySettings property)
  const employeesWithSalary = employees.filter((emp) => emp.salarySettings);

  // Get employees without salary settings
  const employeesWithoutSalary = employees.filter((emp) => !emp.salarySettings);

  // Calculate stats
  const totalPayroll = payrollRecords.reduce((sum, record) => {
    return sum + parseFloat(record.netPay);
  }, 0);

  const pendingPayments = payrollRecords.filter(
    (record) => record.paymentStatus === "pending",
  ).length;
  const paidPayments = payrollRecords.filter(
    (record) => record.paymentStatus === "paid",
  ).length;

  const canCreatePayroll = ability.can("create", "Payroll");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Payroll Management
          </h1>
          <p className="text-muted-foreground">
            Manage employee salaries, generate payroll, and track payments
          </p>
        </div>
        {canCreatePayroll && (
          <div className="flex gap-2">
            <Button onClick={() => setSetsalaryDialogOpen(true)}>
              <DollarSign className="mr-2 h-4 w-4" />
              Set Salary
            </Button>
            <Button onClick={() => setGeneratePayrollDialogOpen(true)}>
              <Calculator className="mr-2 h-4 w-4" />
              Generate Payroll
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Employees
            </CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-muted-foreground text-xs">
              {employeesWithSalary.length} with salary settings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalPayroll.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">Current year total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Payments
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments}</div>
            <p className="text-muted-foreground text-xs">
              Require payment processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Records</CardTitle>
            <Calculator className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidPayments}</div>
            <p className="text-muted-foreground text-xs">
              Successfully processed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {canCreatePayroll && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common payroll management tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {PAYROLL_FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="hover:bg-muted/50 flex cursor-pointer items-center space-x-3 rounded-lg border p-3 transition-colors"
                    onClick={() => {
                      if (feature.title === "Salary Management") {
                        setSetsalaryDialogOpen(true);
                      } else if (feature.title === "Payroll Generation") {
                        setGeneratePayrollDialogOpen(true);
                      }
                    }}
                  >
                    <div
                      className={`bg-gradient-to-r ${feature.color} rounded-lg p-2`}
                    >
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{feature.title}</p>
                      <p className="text-muted-foreground text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts for missing salary settings */}
      {canCreatePayroll && employeesWithoutSalary.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="h-5 w-5" />
              Action Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-orange-700">
              {employeesWithoutSalary.length} employee(s) don&apos;t have salary
              settings configured.
            </p>
            <div className="flex flex-wrap gap-2">
              {employeesWithoutSalary.slice(0, 5).map((employee) => (
                <Badge
                  key={employee.id}
                  variant="outline"
                  className="border-orange-300"
                >
                  {employee.user?.name ?? "Invited Employee"}
                </Badge>
              ))}
              {employeesWithoutSalary.length > 5 && (
                <Badge variant="outline" className="border-orange-300">
                  +{employeesWithoutSalary.length - 5} more
                </Badge>
              )}
            </div>
            <Button
              className="mt-3"
              size="sm"
              onClick={() => setSetsalaryDialogOpen(true)}
            >
              Set Salary Settings
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>
            Filter payroll records by employee, month, year, or status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PayrollFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onRefresh={handleRefresh}
            isLoading={payrollRecordsQuery.isLoading}
          />
        </CardContent>
      </Card>

      {/* Payroll Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll Records</CardTitle>
          <CardDescription>
            {payrollRecords.length > 0
              ? `Showing ${payrollRecords.length} payroll record${payrollRecords.length !== 1 ? "s" : ""}`
              : "No payroll records found"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={payrollColumns}
            data={payrollRecords}
            meta={{
              onViewPayroll: handleViewPayroll,
              onUpdatePaymentStatus: handleUpdatePaymentStatus,
              onGeneratePayslip: handleGeneratePayslip,
              onQuickDownload: handleQuickDownload,
              isLoading: payrollRecordsQuery.isLoading,
              pendingActionId,
              showEmployeeInfo: canCreatePayroll,
            }}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <SetSalaryDialog
        open={setSalaryDialogOpen}
        onOpenChange={setSetsalaryDialogOpen}
        onSuccess={handleDialogSuccess}
      />

      <GeneratePayrollDialog
        open={generatePayrollDialogOpen}
        onOpenChange={setGeneratePayrollDialogOpen}
        onSuccess={handleDialogSuccess}
      />

      <UpdatePaymentStatusDialog
        open={updatePaymentDialogOpen}
        onOpenChange={setUpdatePaymentDialogOpen}
        payrollRecord={selectedPayrollRecord}
        onSuccess={handleDialogSuccess}
      />

      <PayslipPreviewDialog
        open={payslipPreviewOpen}
        onOpenChange={setPayslipPreviewOpen}
        payrollRecord={
          selectedPayrollRecord
            ? toPayrollRecordWithEmployee(selectedPayrollRecord)
            : null
        }
      />
    </div>
  );
}
