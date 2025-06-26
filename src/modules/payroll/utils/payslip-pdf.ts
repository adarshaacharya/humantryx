import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { PayrollRecordWithEmployee } from "../types";

// Extend jsPDF type to include autoTable properties
interface ExtendedJsPDF extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

export class PayslipPDF {
  private doc: ExtendedJsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin = 15;

  constructor() {
    this.doc = new jsPDF() as ExtendedJsPDF;
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  generatePayslip(
    payrollRecord: PayrollRecordWithEmployee,
    organizationName?: string,
  ): void {
    this.addHeader(payrollRecord, organizationName);
    this.addEmployeeInfo(payrollRecord);
    this.addPayrollDetailsTable(payrollRecord);
    this.addFooter(payrollRecord, organizationName);
  }

  private addHeader(
    payrollRecord: PayrollRecordWithEmployee,
    organizationName?: string,
  ): void {
    // Company Logo Area (smaller)
    this.doc.setFillColor(59, 130, 246);
    this.doc.rect(this.margin, this.margin, 25, 15, "F");

    // Company Logo Text (smaller)
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(10);
    this.doc.text("ORG", this.margin + 6, this.margin + 9);

    // Company Name and Title (more compact)
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(14);
    const orgName = organizationName || "Organization";
    this.doc.text(orgName, this.margin + 30, this.margin + 12);

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(8);
    this.doc.text(
      "Human Resource Management System",
      this.margin + 30,
      this.margin + 20,
    );

    // Payslip Title and Date on the right (smaller)
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(16);
    this.doc.setTextColor(59, 130, 246);
    this.doc.text(
      "PAYSLIP",
      this.pageWidth - this.margin - 40,
      this.margin + 12,
    );

    // Pay period (smaller)
    const [year, month] = payrollRecord.payrollMonth.split("-");
    const payPeriod = new Date(
      parseInt(year || "2024"),
      parseInt(month || "1") - 1,
    ).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(8);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text(
      `For: ${payPeriod}`,
      this.pageWidth - this.margin - 40,
      this.margin + 20,
    );

    // Add line separator (moved up)
    this.doc.setDrawColor(200, 200, 200);
    this.doc.setLineWidth(0.5);
    this.doc.line(
      this.margin,
      this.margin + 30,
      this.pageWidth - this.margin,
      this.margin + 30,
    );
  }

  private addEmployeeInfo(payrollRecord: PayrollRecordWithEmployee): void {
    const startY = this.margin + 45;

    // Employee Information Section (more compact)
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(11);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text("Employee Information", this.margin, startY);

    // Employee details in two columns (more compact)
    const leftColumn = this.margin;
    const rightColumn = this.pageWidth / 2 + 5;
    const currentY = startY + 10;

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9);

    // Left column
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Name:", leftColumn, currentY);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(
      payrollRecord.employee?.user?.name || "N/A",
      leftColumn + 22,
      currentY,
    );

    this.doc.setFont("helvetica", "bold");
    this.doc.text("Email:", leftColumn, currentY + 8);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(
      payrollRecord.employee?.user?.email || "N/A",
      leftColumn + 22,
      currentY + 8,
    );

    this.doc.setFont("helvetica", "bold");
    this.doc.text("Designation:", leftColumn, currentY + 16);
    this.doc.setFont("helvetica", "normal");
    const designation =
      payrollRecord.employee?.designation?.replace(/_/g, " ").toUpperCase() ||
      "N/A";
    this.doc.text(designation, leftColumn + 30, currentY + 16);

    // Right column
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Employee ID:", rightColumn, currentY);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(
      payrollRecord.employeeId.substring(0, 8).toUpperCase(),
      rightColumn + 30,
      currentY,
    );

    this.doc.setFont("helvetica", "bold");
    this.doc.text("Pay Period:", rightColumn, currentY + 8);
    this.doc.setFont("helvetica", "normal");
    const [year, month] = payrollRecord.payrollMonth.split("-");
    const payPeriod = new Date(
      parseInt(year || "2024"),
      parseInt(month || "1") - 1,
    ).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
    this.doc.text(payPeriod, rightColumn + 30, currentY + 8);

    this.doc.setFont("helvetica", "bold");
    this.doc.text("Currency:", rightColumn, currentY + 16);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(payrollRecord.currency, rightColumn + 30, currentY + 16);

    // Add line separator (closer)
    this.doc.setDrawColor(200, 200, 200);
    this.doc.setLineWidth(0.3);
    this.doc.line(
      this.margin,
      startY + 32,
      this.pageWidth - this.margin,
      startY + 32,
    );
  }

  private addPayrollDetailsTable(
    payrollRecord: PayrollRecordWithEmployee,
  ): void {
    const startY = this.margin + 90;

    // Payroll Details Title (smaller)
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(11);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text("Payroll Details", this.margin, startY);

    // Prepare table data (more compact)
    const currency =
      payrollRecord.currency === "USD" ? "$" : payrollRecord.currency;
    const tableData = [
      // Earnings Section
      ["EARNINGS", ""],
      [
        "Basic Salary",
        `${currency}${parseFloat(payrollRecord.baseSalary).toLocaleString()}`,
      ],
      [
        "Bonuses",
        `${currency}${parseFloat(payrollRecord.bonuses || "0").toLocaleString()}`,
      ],
      [
        "Allowances",
        `${currency}${parseFloat(payrollRecord.allowances || "0").toLocaleString()}`,
      ],
      ["", ""],
      // Deductions Section
      ["DEDUCTIONS", ""],
      [
        "Tax Deduction (" + (payrollRecord.taxPercentage || "0") + "%)",
        `${currency}${parseFloat(payrollRecord.taxDeduction || "0").toLocaleString()}`,
      ],
      [
        "Leave Deduction (" + (payrollRecord.unpaidLeaveDays || 0) + " days)",
        `${currency}${parseFloat(payrollRecord.leaveDeduction || "0").toLocaleString()}`,
      ],
      ["", ""],
      // Summary Section
      ["SUMMARY", ""],
      [
        "Gross Pay",
        `${currency}${parseFloat(payrollRecord.grossPay).toLocaleString()}`,
      ],
      [
        "Total Deductions",
        `${currency}${parseFloat(payrollRecord.totalDeductions).toLocaleString()}`,
      ],
      ["", ""],
      // Final Amount
      [
        "NET PAY",
        `${currency}${parseFloat(payrollRecord.netPay).toLocaleString()}`,
      ],
    ];

    autoTable(this.doc, {
      startY: startY + 10,
      head: [["Description", "Amount"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 10,
        halign: "center",
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [60, 60, 60],
        cellPadding: 2,
      },
      columnStyles: {
        0: {
          cellWidth: 110,
          halign: "left",
        },
        1: {
          cellWidth: 50,
          halign: "right",
        },
      },
      didParseCell: function (data) {
        const text = data.cell.text[0];

        // Style section headers
        if (
          text === "EARNINGS" ||
          text === "DEDUCTIONS" ||
          text === "SUMMARY"
        ) {
          data.cell.styles.fillColor = [245, 245, 245];
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.textColor = [0, 0, 0];
          data.cell.styles.halign = "center";
          data.cell.styles.fontSize = 9;
        }

        // Style NET PAY row
        if (
          text === "NET PAY" ||
          (data.column.index === 1 &&
            text?.includes("$") &&
            data.row.index === tableData.length - 1)
        ) {
          data.cell.styles.fillColor = [59, 130, 246];
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.textColor = [255, 255, 255];
          data.cell.styles.fontSize = 10;
        }

        // Style empty rows for spacing
        if (text === "") {
          data.cell.styles.fillColor = [255, 255, 255];
          data.cell.styles.minCellHeight = 4;
        }
      },
    });
  }

  private addFooter(
    payrollRecord: PayrollRecordWithEmployee,
    organizationName?: string,
  ): void {
    const tableEndY = this.doc.lastAutoTable?.finalY ?? 200;
    const footerY = Math.max(tableEndY + 20, this.pageHeight - 40);

    // Notes section if available (more compact)
    if (payrollRecord.notes) {
      const notesY = footerY - 20;
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(8);
      this.doc.setTextColor(0, 0, 0);
      this.doc.text("Notes:", this.margin, notesY);

      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(7);
      this.doc.setTextColor(60, 60, 60);
      const lines = this.doc.splitTextToSize(
        payrollRecord.notes,
        this.pageWidth - 2 * this.margin,
      );
      this.doc.text(lines, this.margin, notesY + 6);
    }

    // Add line separator
    this.doc.setDrawColor(200, 200, 200);
    this.doc.setLineWidth(0.3);
    this.doc.line(
      this.margin,
      footerY - 8,
      this.pageWidth - this.margin,
      footerY - 8,
    );

    // Footer text - more compact
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(7);
    this.doc.setTextColor(100, 100, 100);

    this.doc.text(
      "This is a computer-generated payslip and does not require a signature.",
      this.margin,
      footerY,
    );

    const generatedBy =
      payrollRecord.generatedByEmployee?.user?.name || "System";
    this.doc.text(`Generated by: ${generatedBy}`, this.margin, footerY + 6);

    // Footer text - right side
    const payslipId = `Payslip ID: ${payrollRecord.id.substring(0, 8).toUpperCase()}`;
    const payslipIdWidth = this.doc.getTextWidth(payslipId);
    this.doc.text(
      payslipId,
      this.pageWidth - this.margin - payslipIdWidth,
      footerY,
    );

    const companyText = `${organizationName || "Organization"} - Payroll System`;
    const companyTextWidth = this.doc.getTextWidth(companyText);
    this.doc.text(
      companyText,
      this.pageWidth - this.margin - companyTextWidth,
      footerY + 6,
    );
  }

  download(fileName: string): void {
    this.doc.save(fileName);
  }

  getBlob(): Blob {
    return this.doc.output("blob");
  }

  getDataUrl(): string {
    return this.doc.output("dataurlstring");
  }
}
