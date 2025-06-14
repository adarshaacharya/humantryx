"use client";

import { AttendanceDataTable } from "./components/attendance-data-table";

type Props = {
  employeeId?: string;
};

export function AttendanceHistoryTable({ employeeId }: Props) {
  return (
    <AttendanceDataTable
      employeeId={employeeId}
      showEmployeeFilter={!employeeId}
      title="Attendance History"
      description={
        employeeId
          ? undefined
          : "View and manage all employee attendance records"
      }
    />
  );
}
