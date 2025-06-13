import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/api/root";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type LeaveRequest = RouterOutputs["leave"]["list"]["data"][0];
export type LeaveBalance = RouterOutputs["leave"]["getBalances"][0];
export type LeavePolicy = RouterOutputs["leave"]["getLeavePolicies"][0];

export type LeaveRequestWithEmployee = {
  id: string;
  employeeId: string;
  leaveType:
    | "annual"
    | "sick"
    | "casual"
    | "maternity"
    | "paternity"
    | "emergency";
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  approvedBy?: string | null;
  approvedAt?: string | null;
  rejectionReason?: string | null;
  createdAt: Date;
  updatedAt?: Date | null;
  employee?: {
    id: string;
    designation: string;
    user?: {
      name: string;
      email: string;
      image?: string | null;
    } | null;
  } | null;
  approver?: {
    id: string;
    designation: string;
    user?: {
      name: string;
      email: string;
      image?: string | null;
    } | null;
  } | null;
};

// Filter types for leave requests table
export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";
export type LeaveType =
  | "annual"
  | "sick"
  | "casual"
  | "maternity"
  | "paternity"
  | "emergency";
