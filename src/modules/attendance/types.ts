// Types for attendance components

import type {
  EmployeeDepartment,
  EmployeeDesignation,
} from "@/server/db/consts";

export type AttendanceRecord = {
  id: string;
  employeeId: string;
  clockInTime: Date;
  clockOutTime: Date | null;
  breakStartTime: Date | null;
  breakEndTime: Date | null;
  totalWorkingMinutes: number | null;
  totalBreakMinutes: number | null;
  status: "clocked_in" | "clocked_out" | "break_start" | "break_end";
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  locationClockIn: string | null;
  locationClockOut: string | null;
  employee: {
    id: string;
    designation: EmployeeDesignation;
    department: EmployeeDepartment;
    userId: string | null;
    organizationId: string;
    status: "active" | "invited" | "terminated" | "resigned" | "on_leave";
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    memberId: string | null;
    invitationId: string | null;
    user: {
      id: string;
      name: string;
      email: string;
      image: string | null;
    } | null;
  } | null;
};

export type AttendancePaginationData = {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
};
