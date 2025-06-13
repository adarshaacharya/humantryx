"use client";

import { AttendanceSummaryCard } from "@/modules/attendance/components/attendance-summary-card";
import { AttendanceHistoryTable } from "@/modules/attendance/history/attendance-history-table";

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

      {/* All Attendance Records */}
      <AttendanceHistoryTable />
    </div>
  );
}
