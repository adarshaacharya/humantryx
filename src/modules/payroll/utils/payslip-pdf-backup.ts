import { jsPDF } from "jspdf";
import { applyPlugin } from "jspdf-autotable";
import type { PayrollRecordWithEmployee } from "../types";

// Apply the autoTable plugin to jsPDF
applyPlugin(jsPDF);

// Type declaration for autoTable options
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: {
      startY?: number;
      head?: string[][];
      body?: string[][];
      theme?: "striped" | "grid" | "plain";
      headStyles?: {
        fillColor?: number[] | string;
        textColor?: number[] | string;
        fontStyle?: "normal" | "bold" | "italic" | "bolditalic";
        fontSize?: number;
        halign?: "left" | "center" | "right";
        valign?: "top" | "middle" | "bottom";
      };
      bodyStyles?: {
        fontSize?: number;
        textColor?: number[] | string;
        fillColor?: number[] | string;
        halign?: "left" | "center" | "right";
      };
      margin?: {
        left?: number;
        right?: number;
        top?: number;
        bottom?: number;
      };
      columnStyles?: Record<
        string | number,
        {
          cellWidth?: number;
          halign?: "left" | "center" | "right";
          fillColor?: number[] | string;
        }
      >;
    }) => jsPDF;
  }
}

export class PayslipPDF {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin = 20;

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  generatePayslip(payrollRecord: PayrollRecordWithEmployee): void {
    this.addHeader(payrollRecord);
    this.addEmployeeInfo(payrollRecord);
    this.addPayrollDetailsTable(payrollRecord);
    this.addFooter(payrollRecord);
  }

  private addHeader(payrollRecord: PayrollRecordWithEmployee): void {
    // Company Logo Area (placeholder)
    this.doc.setFillColor(59, 130, 246); // Blue color
    this.doc.rect(this.margin, this.margin, 30, 20, "F");

    // Company Logo Text
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(14);
    this.doc.text("ORG", this.margin + 5, this.margin + 13);

    // Company Name and Title
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(18);
    // Get organization name dynamically (for now using a placeholder)
    const orgName = "Humantryx HRMS"; // Can be made dynamic later
    this.doc.text(orgName, this.margin + 35, this.margin + 15);

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(10);
    this.doc.text(
      "Human Resource Management System",
      this.margin + 35,
      this.margin + 25,
    );

    // Payslip Title and Date on the right
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(16);
    this.doc.setTextColor(59, 130, 246);
    this.doc.text(
      "SALARY SLIP",
      this.pageWidth - this.margin - 50,
      this.margin + 15,
    );

    // Pay period
    const [year, month] = payrollRecord.payrollMonth.split("-");
    const payPeriod = new Date(
      parseInt(year || "2024"),
      parseInt(month || "1") - 1,
    ).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
    
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(10);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text(
      `For: ${payPeriod}`,
      this.pageWidth - this.margin - 50,
      this.margin + 25,
    );

    // Add line separator
    this.doc.setDrawColor(200, 200, 200);
    this.doc.setLineWidth(0.5);
    this.doc.line(
      this.margin,
      this.margin + 40,
      this.pageWidth - this.margin,
      this.margin + 40,
    );
  }

  private addEmployeeInfo(payrollRecord: PayrollRecordWithEmployee): void {
    const startY = this.margin + 60;

    // Employee Information Section
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(14);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text("Employee Information", this.margin, startY);

    // Employee details in two columns
    const leftColumn = this.margin;
    const rightColumn = this.pageWidth / 2 + 10;
    const currentY = startY + 15;

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(11);

    // Left column
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Name:", leftColumn, currentY);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(
      payrollRecord.employee?.user?.name || "N/A",
      leftColumn + 25,
      currentY,
    );

    this.doc.setFont("helvetica", "bold");
    this.doc.text("Email:", leftColumn, currentY + 12);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(
      payrollRecord.employee?.user?.email || "N/A",
      leftColumn + 25,
      currentY + 12,
    );

    this.doc.setFont("helvetica", "bold");
    this.doc.text("Designation:", leftColumn, currentY + 24);
    this.doc.setFont("helvetica", "normal");
    const designation =
      payrollRecord.employee?.designation?.replace(/_/g, " ").toUpperCase() ||
      "N/A";
    this.doc.text(designation, leftColumn + 35, currentY + 24);

    // Right column
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Employee ID:", rightColumn, currentY);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(
      payrollRecord.employeeId.substring(0, 8).toUpperCase(),
      rightColumn + 35,
      currentY,
    );

    this.doc.setFont("helvetica", "bold");
    this.doc.text("Pay Period:", rightColumn, currentY + 12);
    this.doc.setFont("helvetica", "normal");
    const [year, month] = payrollRecord.payrollMonth.split("-");
    const payPeriod = new Date(
      parseInt(year || "2024"),
      parseInt(month || "1") - 1,
    ).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
    this.doc.text(payPeriod, rightColumn + 35, currentY + 12);

    this.doc.setFont("helvetica", "bold");
    this.doc.text("Currency:", rightColumn, currentY + 24);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(payrollRecord.currency, rightColumn + 35, currentY + 24);

    // Add line separator
    this.doc.setDrawColor(200, 200, 200);
    this.doc.setLineWidth(0.3);
    this.doc.line(
      this.margin,
      startY + 50,
      this.pageWidth - this.margin,
      startY + 50,
    );
  }

  private addPayrollDetailsTable(payrollRecord: PayrollRecordWithEmployee): void {
    const startY = this.margin + 125;

    // Payroll Details Title
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(14);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text("Payroll Details", this.margin, startY);

    // Prepare table data
    const tableData = [
      // Earnings Section
      ["EARNINGS", "", ""],
      ["Basic Salary", `$${parseFloat(payrollRecord.baseSalary).toLocaleString()}`, ""],
      ["Bonuses", `$${parseFloat(payrollRecord.bonuses || "0").toLocaleString()}`, ""],
      ["Allowances", `$${parseFloat(payrollRecord.allowances || "0").toLocaleString()}`, ""],
      ["", "", ""],
      ["DEDUCTIONS", "", ""],
      ["Tax Deduction", `$${parseFloat(payrollRecord.taxDeduction || "0").toLocaleString()}`, ""],
      ["Leave Deduction", `$${parseFloat(payrollRecord.leaveDeduction || "0").toLocaleString()}`, ""],
      ["", "", ""],
      ["TOTALS", "", ""],
      ["Gross Pay", `$${parseFloat(payrollRecord.grossPay).toLocaleString()}`, ""],
      ["Total Deductions", `$${parseFloat(payrollRecord.totalDeductions).toLocaleString()}`, ""],
      ["NET PAY", `$${parseFloat(payrollRecord.netPay).toLocaleString()}`, ""],
    ];

    this.doc.autoTable({
      startY: startY + 15,
      head: [["Description", "Amount", "Notes"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 11,
        halign: "center",
      },
      bodyStyles: {
        fontSize: 10,
        textColor: [60, 60, 60],
      },
      columnStyles: {
        0: { 
          cellWidth: 70, 
          halign: "left",
          fillColor: function(row: any) {
            const description = row.raw[0];
            if (description === "EARNINGS" || description === "DEDUCTIONS" || description === "TOTALS") {
              return [245, 245, 245];
            }
            if (description === "NET PAY") {
              return [59, 130, 246];
            }
            return [255, 255, 255];
          }
        },
        1: { 
          cellWidth: 40, 
          halign: "right",
          fillColor: function(row: any) {
            const description = row.raw[0];
            if (description === "NET PAY") {
              return [59, 130, 246];
            }
            return [255, 255, 255];
          }
        },
        2: { 
          cellWidth: 60, 
          halign: "left",
          fillColor: [255, 255, 255]
        },
      },
    });
  }
    const startY = this.margin + 125;

    // Payroll Summary Section
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(14);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text("Payroll Summary", this.margin, startY);

    // Summary boxes
    const boxWidth = 50;
    const boxHeight = 25;
    const spacing = 10;
    let currentX = this.margin;
    const currentY = startY + 15;

    // Gross Pay
    this.doc.setFillColor(240, 253, 244);
    this.doc.setDrawColor(34, 197, 94);
    this.doc.rect(currentX, currentY, boxWidth, boxHeight, "FD");
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(8);
    this.doc.setTextColor(21, 128, 61);
    this.doc.text("GROSS PAY", currentX + 5, currentY + 8);
    this.doc.setFontSize(12);
    this.doc.text(
      `$${parseFloat(payrollRecord.grossPay).toLocaleString()}`,
      currentX + 5,
      currentY + 18,
    );

    // Total Deductions
    currentX += boxWidth + spacing;
    this.doc.setFillColor(254, 242, 242);
    this.doc.setDrawColor(239, 68, 68);
    this.doc.rect(currentX, currentY, boxWidth, boxHeight, "FD");
    this.doc.setTextColor(185, 28, 28);
    this.doc.setFontSize(8);
    this.doc.text("DEDUCTIONS", currentX + 5, currentY + 8);
    this.doc.setFontSize(12);
    this.doc.text(
      `$${parseFloat(payrollRecord.totalDeductions).toLocaleString()}`,
      currentX + 5,
      currentY + 18,
    );

    // Net Pay
    currentX += boxWidth + spacing;
    this.doc.setFillColor(239, 246, 255);
    this.doc.setDrawColor(59, 130, 246);
    this.doc.rect(currentX, currentY, boxWidth, boxHeight, "FD");
    this.doc.setTextColor(29, 78, 216);
    this.doc.setFontSize(8);
    this.doc.text("NET PAY", currentX + 5, currentY + 8);
    this.doc.setFontSize(12);
    this.doc.text(
      `$${parseFloat(payrollRecord.netPay).toLocaleString()}`,
      currentX + 5,
      currentY + 18,
    );
  }

  private addEarningsAndDeductionsTables(
    payrollRecord: PayrollRecordWithEmployee,
  ): void {
    const startY = this.margin + 185;

    // Earnings Table (Left side)
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(12);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text("Earnings", this.margin, startY);

    const earningsData = [
      [
        "Basic Salary",
        `$${parseFloat(payrollRecord.baseSalary).toLocaleString()}`,
      ],
      [
        "Bonuses",
        `$${parseFloat(payrollRecord.bonuses || "0").toLocaleString()}`,
      ],
      [
        "Allowances",
        `$${parseFloat(payrollRecord.allowances || "0").toLocaleString()}`,
      ],
    ];

    // Calculate the end Y position after the earnings table
    const earningsTableHeight = (earningsData.length + 1) * 8; // Approximate height

    this.doc.autoTable({
      startY: startY + 10,
      head: [["Description", "Amount"]],
      body: earningsData,
      theme: "grid",
      headStyles: {
        fillColor: [34, 197, 94],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [60, 60, 60],
      },
      columnStyles: {
        0: { cellWidth: 60, halign: "left" },
        1: { cellWidth: 30, halign: "right" },
      },
    });

    // Deductions Table (Below earnings)
    const deductionsStartY = startY + earningsTableHeight + 30;

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(12);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text("Deductions", this.margin, deductionsStartY);

    const deductionsData = [
      [
        "Tax Deduction",
        `$${parseFloat(payrollRecord.taxDeduction || "0").toLocaleString()}`,
      ],
      [
        "Leave Deduction",
        `$${parseFloat(payrollRecord.leaveDeduction || "0").toLocaleString()}`,
      ],
      ["Other Deductions", "$0.00"],
    ];

    this.doc.autoTable({
      startY: deductionsStartY + 10,
      head: [["Description", "Amount"]],
      body: deductionsData,
      theme: "grid",
      headStyles: {
        fillColor: [239, 68, 68],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 10,
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [60, 60, 60],
      },
      columnStyles: {
        0: { cellWidth: 60, halign: "left" },
        1: { cellWidth: 30, halign: "right" },
      },
    });
  }

  private addNetPaySection(payrollRecord: PayrollRecordWithEmployee): void {
    const startY = this.margin + 330; // Adjusted for stacked tables

    // Net Pay Section with highlight
    this.doc.setFillColor(29, 78, 216);
    this.doc.rect(
      this.margin,
      startY,
      this.pageWidth - 2 * this.margin,
      25,
      "F",
    );

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(16);
    this.doc.setTextColor(255, 255, 255);
    this.doc.text("Total Net Pay:", this.margin + 10, startY + 12);

    this.doc.setFontSize(20);
    const netPay = `$${parseFloat(payrollRecord.netPay).toLocaleString()}`;
    this.doc.text(netPay, this.pageWidth - this.margin - 60, startY + 15);

    // Payment status
    const statusY = startY + 35;
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(11);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text("Payment Status:", this.margin, statusY);

    // Status badge
    const status = payrollRecord.paymentStatus;
    let statusColor: [number, number, number] = [100, 100, 100];
    const statusText = status.toUpperCase();

    switch (status) {
      case "paid":
        statusColor = [34, 197, 94];
        break;
      case "pending":
        statusColor = [234, 179, 8];
        break;
      case "cancelled":
        statusColor = [239, 68, 68];
        break;
    }

    this.doc.setFillColor(...statusColor);
    this.doc.rect(this.margin + 45, statusY - 5, 25, 10, "F");
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(8);
    this.doc.text(statusText, this.margin + 50, statusY + 1);

    if (payrollRecord.paymentDate) {
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(9);
      const paymentDate = new Date(
        payrollRecord.paymentDate,
      ).toLocaleDateString();
      this.doc.text(`Payment Date: ${paymentDate}`, this.margin + 80, statusY);
    }

    if (payrollRecord.paymentReference) {
      this.doc.text(
        `Reference: ${payrollRecord.paymentReference}`,
        this.margin + 80,
        statusY + 10,
      );
    }
  }

  private addFooter(payrollRecord: PayrollRecordWithEmployee): void {
    const footerY = this.pageHeight - 40;

    // Add line separator
    this.doc.setDrawColor(200, 200, 200);
    this.doc.setLineWidth(0.3);
    this.doc.line(
      this.margin,
      footerY - 10,
      this.pageWidth - this.margin,
      footerY - 10,
    );

    // Footer text
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(8);
    this.doc.setTextColor(100, 100, 100);

    this.doc.text(
      "This is a computer-generated payslip and does not require a signature.",
      this.margin,
      footerY,
    );

    const generatedBy =
      payrollRecord.generatedByEmployee?.user?.name || "System";
    this.doc.text(`Generated by: ${generatedBy}`, this.margin, footerY + 8);

    const payslipId = `Payslip ID: ${payrollRecord.id.substring(0, 8).toUpperCase()}`;
    this.doc.text(payslipId, this.pageWidth - this.margin - 50, footerY);

    this.doc.text(
      "Humantryx - Payroll Management System",
      this.pageWidth - this.margin - 80,
      footerY + 8,
    );

    // Notes section if available
    if (payrollRecord.notes) {
      const notesY = footerY - 25;
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(9);
      this.doc.setTextColor(0, 0, 0);
      this.doc.text("Notes:", this.margin, notesY);

      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(8);
      this.doc.setTextColor(60, 60, 60);
      const lines = this.doc.splitTextToSize(
        payrollRecord.notes,
        this.pageWidth - 2 * this.margin,
      );
      this.doc.text(lines, this.margin, notesY + 8);
    }
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
