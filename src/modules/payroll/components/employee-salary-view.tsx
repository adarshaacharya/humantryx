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
import { AlertCircle, DollarSign, Calendar, Calculator } from "lucide-react";
import { authClient } from "@/server/auth/auth-client";
import { format } from "date-fns";

import { payrollColumns } from "./payroll-table-columns";
import { PayslipPreviewDialog } from "./payslip-preview-dialog";
import { usePayslipGenerator } from "../hooks/use-payslip-generator";
import type { PayrollRecord, PayrollRecordWithEmployee } from "../types";
import { toPayrollRecordWithEmployee } from "../types";
import { getPaymentStatusBadge } from "../constants";
import { useCurrentEmployee } from "@/hooks/use-current-employee";

export function EmployeeSalaryView() {
  const [payslipPreviewOpen, setPayslipPreviewOpen] = useState(false);
  const [selectedPayrollRecord, setSelectedPayrollRecord] =
    useState<PayrollRecordWithEmployee | null>(null);

  const { data: session } = authClient.useSession();
  const organizationId = session?.session?.activeOrganizationId;
  const { generatePayslip } = usePayslipGenerator();
  const employeeId = useCurrentEmployee()?.id;

  const salarySettingsQuery = api.payroll.getSalarySettings.useQuery(
    {
      employeeId: employeeId,
    },
    { enabled: !!employeeId },
  );

  const payrollRecordsQuery = api.payroll.getPayrollRecords.useQuery(
    {
      employeeId: employeeId,
    },
    { enabled: !!employeeId },
  );

  const handleGeneratePayslip = useCallback((record: PayrollRecord) => {
    const convertedRecord = toPayrollRecordWithEmployee(record);
    if (convertedRecord) {
      setSelectedPayrollRecord(convertedRecord);
      setPayslipPreviewOpen(true);
    }
  }, []);

  const handleQuickDownload = useCallback(
    (record: PayrollRecord) => {
      const convertedRecord = toPayrollRecordWithEmployee(record);
      if (convertedRecord) {
        generatePayslip(convertedRecord);
      }
    },
    [generatePayslip],
  );

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
                Error loading salary information
              </p>
              <p className="text-muted-foreground text-sm">
                {payrollRecordsQuery.error.message}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => payrollRecordsQuery.refetch()}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const payrollRecords = payrollRecordsQuery.data ?? [];
  const salarySettings = salarySettingsQuery.data;

  // Calculate stats
  const currentYear = new Date().getFullYear();
  const currentYearRecords = payrollRecords.filter((record) =>
    record.payrollMonth.startsWith(currentYear.toString()),
  );

  const totalEarnings = currentYearRecords.reduce((sum, record) => {
    return sum + parseFloat(record.netPay);
  }, 0);

  const totalTaxDeducted = currentYearRecords.reduce((sum, record) => {
    return sum + parseFloat(record.taxDeduction ?? "0");
  }, 0);

  const latestPayroll = payrollRecords[0]; // Assuming records are sorted by date desc

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Salary</h1>
          <p className="text-muted-foreground">
            View your salary information, payroll history, and download payslips
          </p>
        </div>
      </div>

      {/* Salary Settings Card */}
      {salarySettings ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Current Salary Information
            </CardTitle>
            <CardDescription>Your current salary configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="text-muted-foreground text-sm font-medium">
                  Base Salary
                </div>
                <div className="text-2xl font-bold text-green-600">
                  ${parseFloat(salarySettings.baseSalary).toLocaleString()}
                  /month
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-muted-foreground text-sm font-medium">
                  Tax Rate
                </div>
                <div className="text-2xl font-bold">
                  {parseFloat(salarySettings.taxPercentage ?? "0")}%
                </div>
              </div>
            </div>
            <div className="mt-4 border-t pt-4">
              <div className="text-muted-foreground text-sm">
                Annual Gross Salary:{" "}
                <span className="font-medium">
                  $
                  {(
                    parseFloat(salarySettings.baseSalary) * 12
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="flex items-center justify-center py-8">
            <div className="space-y-2 text-center">
              <AlertCircle className="mx-auto h-8 w-8 text-orange-600" />
              <p className="font-medium text-orange-800">Salary Not Set</p>
              <p className="text-sm text-orange-700">
                Your salary information has not been configured yet. Please
                contact HR.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Year Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings ({currentYear})
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalEarnings.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">
              {currentYearRecords.length} payroll record
              {currentYearRecords.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tax Deducted ({currentYear})
            </CardTitle>
            <Calculator className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${totalTaxDeducted.toLocaleString()}
            </div>
            <p className="text-muted-foreground text-xs">
              For tax filing purposes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Latest Payment
            </CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {latestPayroll ? (
              <>
                <div className="text-2xl font-bold text-purple-600">
                  ${parseFloat(latestPayroll.netPay).toLocaleString()}
                </div>
                <p className="text-muted-foreground text-xs">
                  {format(
                    new Date(latestPayroll.payrollMonth + "-01"),
                    "MMMM yyyy",
                  )}
                </p>
                <Badge
                  variant={
                    getPaymentStatusBadge(latestPayroll.paymentStatus).variant
                  }
                  className="mt-1"
                >
                  {getPaymentStatusBadge(latestPayroll.paymentStatus).label}
                </Badge>
              </>
            ) : (
              <>
                <div className="text-muted-foreground text-2xl font-bold">
                  No records
                </div>
                <p className="text-muted-foreground text-xs">
                  No payroll generated yet
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payroll History */}
      <Card>
        <CardHeader>
          <CardTitle>Payroll History</CardTitle>
          <CardDescription>
            {payrollRecords.length > 0
              ? `Your payroll history (${payrollRecords.length} record${payrollRecords.length !== 1 ? "s" : ""})`
              : "No payroll records found"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payrollRecords.length > 0 ? (
            <DataTable
              initialState={{
                columnVisibility: {
                  employee: false,
                },
              }}
              columns={payrollColumns}
              data={payrollRecords}
              meta={{
                onGeneratePayslip: handleGeneratePayslip,
                onQuickDownload: handleQuickDownload,
                showEmployeeInfo: false, // Don't show employee info for own view
              }}
            />
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="space-y-2 text-center">
                <Calendar className="text-muted-foreground mx-auto h-8 w-8" />
                <p className="text-muted-foreground font-medium">
                  No payroll records
                </p>
                <p className="text-muted-foreground text-sm">
                  Your payroll records will appear here once generated by HR
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payslip Preview Dialog */}
      <PayslipPreviewDialog
        open={payslipPreviewOpen}
        onOpenChange={setPayslipPreviewOpen}
        payrollRecord={selectedPayrollRecord}
      />
    </div>
  );
}
