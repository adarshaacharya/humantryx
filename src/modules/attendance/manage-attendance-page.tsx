"use client";

import { AttendanceSummaryCard } from "@/modules/attendance/history/components/attendance-summary-card";
import { AttendanceDataTable } from "@/modules/attendance/history/components/attendance-data-table";

export function ManageAttendancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manage Attendance</h1>
        <p className="text-muted-foreground">
          Monitor and manage employee attendance records
        </p>
      </div>

      {/* Summary with Employee Selector */}
      <AttendanceSummaryCard showEmployeeSelector />

      {/* All Attendance Records with Data Table */}
      <AttendanceDataTable
        showEmployeeFilter={true}
        title="All Employee Attendance"
        description="View and manage attendance records for all employees"
      />
    </div>
  );
}
