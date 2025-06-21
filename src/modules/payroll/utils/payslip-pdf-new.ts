import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { PayrollRecordWithEmployee } from "../types";

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
    this.doc.setFillColor(59, 130, 246);
    this.doc.rect(this.margin, this.margin, 30, 20, "F");

    // Company Logo Text
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(12);
    this.doc.text("ORG", this.margin + 8, this.margin + 13);

    // Company Name and Title
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(18);
    const orgName = "Humantryx HRMS";
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
    this.doc.setFontSize(20);
    this.doc.setTextColor(59, 130, 246);
    this.doc.text(
      "PAYSLIP",
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

  private addPayrollDetailsTable(
    payrollRecord: PayrollRecordWithEmployee,
  ): void {
    const startY = this.margin + 125;

    // Payroll Details Title
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(14);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text("Payroll Details", this.margin, startY);

    // Prepare table data like a traditional bill
    const tableData = [
      // Earnings Section
      ["EARNINGS", "", ""],
      [
        "Basic Salary",
        parseFloat(payrollRecord.baseSalary).toLocaleString(),
        "$",
      ],
      [
        "Bonuses",
        parseFloat(payrollRecord.bonuses || "0").toLocaleString(),
        "$",
      ],
      [
        "Allowances",
        parseFloat(payrollRecord.allowances || "0").toLocaleString(),
        "$",
      ],
      ["", "", ""],
      // Deductions Section
      ["DEDUCTIONS", "", ""],
      [
        "Tax Deduction (" + (payrollRecord.taxPercentage || "0") + "%)",
        parseFloat(payrollRecord.taxDeduction || "0").toLocaleString(),
        "$",
      ],
      [
        "Leave Deduction (" + (payrollRecord.unpaidLeaveDays || 0) + " days)",
        parseFloat(payrollRecord.leaveDeduction || "0").toLocaleString(),
        "$",
      ],
      ["", "", ""],
      // Summary Section
      ["SUMMARY", "", ""],
      ["Gross Pay", parseFloat(payrollRecord.grossPay).toLocaleString(), "$"],
      [
        "Total Deductions",
        parseFloat(payrollRecord.totalDeductions).toLocaleString(),
        "$",
      ],
      ["", "", ""],
      // Final Amount
      ["NET PAY", parseFloat(payrollRecord.netPay).toLocaleString(), "$"],
    ];

    autoTable(this.doc, {
      startY: startY + 15,
      head: [["Description", "Amount", "Currency"]],
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
          cellWidth: 80,
          halign: "left",
        },
        1: {
          cellWidth: 40,
          halign: "right",
        },
        2: {
          cellWidth: 20,
          halign: "center",
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
        }

        // Style NET PAY row
        if (text === "NET PAY") {
          data.cell.styles.fillColor = [59, 130, 246];
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.textColor = [255, 255, 255];
          data.cell.styles.fontSize = 12;
        }

        // Style empty rows
        if (text === "") {
          data.cell.styles.fillColor = [255, 255, 255];
          data.cell.styles.minCellHeight = 5;
        }
      },
    });

    // Add payment status after table
    const finalY = (this.doc as any).lastAutoTable.finalY + 20;

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(12);
    this.doc.setTextColor(0, 0, 0);
    this.doc.text("Payment Status:", this.margin, finalY);

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
    this.doc.rect(this.margin + 50, finalY - 6, 30, 12, "F");
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(9);
    this.doc.text(statusText, this.margin + 58, finalY);

    // Payment details
    if (payrollRecord.paymentDate) {
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(9);
      const paymentDate = new Date(
        payrollRecord.paymentDate,
      ).toLocaleDateString();
      this.doc.text(`Payment Date: ${paymentDate}`, this.margin + 90, finalY);
    }

    if (payrollRecord.paymentReference) {
      this.doc.text(
        `Reference: ${payrollRecord.paymentReference}`,
        this.margin + 90,
        finalY + 10,
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
