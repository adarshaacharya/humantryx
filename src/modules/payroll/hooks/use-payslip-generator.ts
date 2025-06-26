import { useCallback } from "react";
import { toast } from "sonner";
import { PayslipPDF } from "../utils/payslip-pdf";
import type { PayrollRecordWithEmployee } from "../types";
import { authClient } from "@/server/auth/auth-client";

export function usePayslipGenerator() {
  const { data: currentOrg } = authClient.useActiveOrganization();

  const generatePayslip = useCallback(
    (payrollRecord: PayrollRecordWithEmployee) => {
      try {
        // Validate required data
        if (!payrollRecord.employee?.user?.name) {
          toast.error(
            "Employee information is missing. Cannot generate payslip.",
          );
          return;
        }

        const pdf = new PayslipPDF();
        const organizationName = currentOrg?.name || "Organization";

        pdf.generatePayslip(payrollRecord, organizationName);

        const employeeName = payrollRecord.employee.user.name.replace(
          /\s+/g,
          "_",
        );
        const [year, month] = payrollRecord.payrollMonth.split("-");
        const monthName = new Date(
          parseInt(year || "2024"),
          parseInt(month || "1") - 1,
        ).toLocaleDateString("en-US", { month: "long" });
        const fileName = `Payslip_${employeeName}_${monthName}_${year || "2024"}.pdf`;

        // Download the PDF
        pdf.download(fileName);

        toast.success(`Payslip downloaded successfully: ${fileName}`);
      } catch (error) {
        console.error("Error generating payslip:", error);
        toast.error("Failed to generate payslip. Please try again.");
      }
    },
    [currentOrg?.name],
  );

  const generatePayslipBlob = useCallback(
    (payrollRecord: PayrollRecordWithEmployee): Blob | null => {
      try {
        if (!payrollRecord.employee?.user?.name) {
          toast.error(
            "Employee information is missing. Cannot generate payslip.",
          );
          return null;
        }

        const pdf = new PayslipPDF();
        const organizationName = currentOrg?.name || "Organization";
        pdf.generatePayslip(payrollRecord, organizationName);
        return pdf.getBlob();
      } catch (error) {
        console.error("Error generating payslip blob:", error);
        toast.error("Failed to generate payslip.");
        return null;
      }
    },
    [currentOrg?.name],
  );

  const generatePayslipDataUrl = useCallback(
    (payrollRecord: PayrollRecordWithEmployee): string | null => {
      try {
        if (!payrollRecord.employee?.user?.name) {
          toast.error(
            "Employee information is missing. Cannot generate payslip.",
          );
          return null;
        }

        const pdf = new PayslipPDF();
        const organizationName = currentOrg?.name || "Organization";
        pdf.generatePayslip(payrollRecord, organizationName);
        return pdf.getDataUrl();
      } catch (error) {
        console.error("Error generating payslip data URL:", error);
        toast.error("Failed to generate payslip.");
        return null;
      }
    },
    [currentOrg?.name],
  );

  return {
    generatePayslip,
    generatePayslipBlob,
    generatePayslipDataUrl,
  };
}
