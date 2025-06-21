"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Download, Eye, FileText } from "lucide-react";
import { usePayslipGenerator } from "../hooks/use-payslip-generator";
import type { PayrollRecordWithEmployee } from "../types";

interface PayslipPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payrollRecord: PayrollRecordWithEmployee | null;
}

export function PayslipPreviewDialog({
  open,
  onOpenChange,
  payrollRecord,
}: PayslipPreviewDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { generatePayslip } = usePayslipGenerator();

  if (!payrollRecord) return null;

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      generatePayslip(payrollRecord);
    } finally {
      setIsGenerating(false);
    }
  };

  const [year, month] = payrollRecord.payrollMonth.split("-");
  const payPeriod = new Date(
    parseInt(year || "2024"),
    parseInt(month || "1") - 1,
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="border-green-300 bg-green-100 text-green-800">
            Paid
          </Badge>
        );
      case "pending":
        return (
          <Badge className="border-yellow-300 bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="border-red-300 bg-red-100 text-red-800">
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-3/4 min-w-5xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Payslip Preview
          </DialogTitle>
          <DialogDescription>
            Review payslip details before downloading
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Section */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-blue-600">
                    Humantryx
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">
                    Human Resource Management System
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">PAYSLIP</p>
                  <p className="text-muted-foreground text-sm">
                    Generated: {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-muted-foreground text-sm font-medium">
                    Employee
                  </h4>
                  <p className="text-lg font-semibold">
                    {payrollRecord.employee?.user?.name || "N/A"}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {payrollRecord.employee?.user?.email || "N/A"}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {payrollRecord.employee?.designation
                      ?.replace(/_/g, " ")
                      .toUpperCase() || "N/A"}
                  </p>
                </div>
                <div>
                  <h4 className="text-muted-foreground text-sm font-medium">
                    Pay Period
                  </h4>
                  <p className="text-lg font-semibold">{payPeriod}</p>
                  <p className="text-muted-foreground text-sm">
                    Currency: {payrollRecord.currency}
                  </p>
                  <div className="mt-2">
                    {getStatusBadge(payrollRecord.paymentStatus)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-6">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6 pb-6">
                <div className="text-center">
                  <p className="mb-2 text-sm font-medium text-green-800">
                    Gross Pay
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    ${parseFloat(payrollRecord.grossPay).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6 pb-6">
                <div className="text-center">
                  <p className="mb-2 text-sm font-medium text-red-800">
                    Deductions
                  </p>
                  <p className="text-3xl font-bold text-red-600">
                    $
                    {parseFloat(payrollRecord.totalDeductions).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6 pb-6">
                <div className="text-center">
                  <p className="mb-2 text-sm font-medium text-blue-800">
                    Net Pay
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    ${parseFloat(payrollRecord.netPay).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Earnings and Deductions */}
          <div className="grid grid-cols-2 gap-8">
            {/* Earnings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-green-600">
                  Earnings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between py-2">
                  <span className="text-base">Basic Salary</span>
                  <span className="text-base font-medium">
                    ${parseFloat(payrollRecord.baseSalary).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-base">Bonuses</span>
                  <span className="text-base font-medium">
                    ${parseFloat(payrollRecord.bonuses || "0").toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-base">Allowances</span>
                  <span className="text-base font-medium">
                    $
                    {parseFloat(
                      payrollRecord.allowances || "0",
                    ).toLocaleString()}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between py-2 text-lg font-semibold text-green-600">
                  <span>Total Earnings</span>
                  <span>
                    ${parseFloat(payrollRecord.grossPay).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Deductions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-red-600">
                  Deductions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between py-2">
                  <span className="text-base">
                    Tax Deduction (
                    {parseFloat(payrollRecord.taxPercentage || "0")}%)
                  </span>
                  <span className="text-base font-medium">
                    $
                    {parseFloat(
                      payrollRecord.taxDeduction || "0",
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-base">
                    Leave Deduction ({payrollRecord.unpaidLeaveDays || 0} days)
                  </span>
                  <span className="text-base font-medium">
                    $
                    {parseFloat(
                      payrollRecord.leaveDeduction || "0",
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-base">Other Deductions</span>
                  <span className="text-base font-medium">$0.00</span>
                </div>
                <Separator />
                <div className="flex justify-between py-2 text-lg font-semibold text-red-600">
                  <span>Total Deductions</span>
                  <span>
                    $
                    {parseFloat(payrollRecord.totalDeductions).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Payment Status:</span>
                    <span>{getStatusBadge(payrollRecord.paymentStatus)}</span>
                  </div>
                  {payrollRecord.paymentDate && (
                    <div className="flex justify-between">
                      <span className="font-medium">Payment Date:</span>
                      <span>
                        {new Date(
                          payrollRecord.paymentDate,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  {payrollRecord.paymentReference && (
                    <div className="flex justify-between">
                      <span className="font-medium">Reference:</span>
                      <span className="font-mono text-sm">
                        {payrollRecord.paymentReference}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-medium">Working Days:</span>
                    <span>{payrollRecord.totalWorkingDays}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {payrollRecord.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-base">
                  {payrollRecord.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Footer Info */}
          <div className="text-muted-foreground space-y-2 border-t pt-4 text-center text-sm">
            <p>
              This is a computer-generated payslip and does not require a
              signature.
            </p>
            <p>Payslip ID: {payrollRecord.id.substring(0, 8).toUpperCase()}</p>
            <p>
              Generated by:{" "}
              {payrollRecord.generatedByEmployee?.user?.name || "System"}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            size="lg"
          >
            <Eye className="mr-2 h-4 w-4" />
            Close Preview
          </Button>
          <Button
            onClick={handleDownload}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            <Download className="mr-2 h-4 w-4" />
            {isGenerating ? "Generating..." : "Download PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
