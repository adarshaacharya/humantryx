import { AttendanceClockCard } from "@/modules/attendance/clock/attendance-clock-card";
import { AttendanceSummaryCard } from "@/modules/attendance/history/components/attendance-summary-card";
import { AttendanceDataTable } from "@/modules/attendance/history/components/attendance-data-table";
import { api } from "@/trpc/server";

export async function MyAttendancePage() {
  const employee = await api.employee.getCurrentEmployee();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Attendance</h1>
        <p className="text-muted-foreground">
          Track your working hours and attendance
        </p>
      </div>

      {/* Clock In/Out and Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        <AttendanceClockCard />
        <AttendanceSummaryCard />
      </div>

      {/* Attendance History */}
      <AttendanceDataTable
        employeeId={employee?.id}
        showEmployeeFilter={false}
        title="My Attendance History"
        description="Your recent attendance records"
      />
    </div>
  );
}
