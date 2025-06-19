import { z } from "zod";

export const createLeaveRequestSchema = z.object({
  leaveType: z
    .enum(["annual", "sick", "casual", "maternity", "paternity", "emergency"])
    .describe("Type of leave being requested"),
  startDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Invalid start date")
    .describe("Start date of the leave request"),
  endDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Invalid end date")
    .describe("End date of the leave request"),
  reason: z
    .string()
    .min(10, "Reason must be at least 10 characters")
    .describe("Reason for the leave request"),
});

export const updateLeaveRequestSchema = z.object({
  id: z.string().uuid(),
  leaveType: z
    .enum(["annual", "sick", "casual", "maternity", "paternity", "emergency"])
    .optional(),
  startDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Invalid start date")
    .optional(),
  endDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Invalid end date")
    .optional(),
  reason: z
    .string()
    .min(10, "Reason must be at least 10 characters")
    .optional(),
});

export const updateLeaveStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["approved", "rejected", "cancelled"]),
  rejectionReason: z.string().optional(),
});

export const approveRejectLeaveSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["approved", "rejected"]),
  rejectionReason: z.string().optional(),
});

export const leaveRequestListSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  employeeId: z.string().uuid().optional(),
  status: z.enum(["pending", "approved", "rejected", "cancelled"]).optional(),
  leaveType: z
    .enum(["annual", "sick", "casual", "maternity", "paternity", "emergency"])
    .optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const leaveFiltersSchema = z.object({
  employeeId: z.string().uuid().optional(),
  status: z.enum(["pending", "approved", "rejected", "cancelled"]).optional(),
  leaveType: z
    .enum(["annual", "sick", "casual", "maternity", "paternity", "emergency"])
    .optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const leaveBalanceSchema = z.object({
  employeeId: z.string().uuid().optional(),
  leaveType: z
    .enum(["annual", "sick", "casual", "maternity", "paternity", "emergency"])
    .optional(),
});

export const createLeavePolicySchema = z.object({
  leaveType: z.enum([
    "annual",
    "sick",
    "casual",
    "maternity",
    "paternity",
    "emergency",
  ]),
  defaultAllowance: z.number().min(0),
  carryForward: z.boolean().optional().default(false),
  maxCarryForward: z.number().min(0).optional().default(0),
});

export const updateLeavePolicySchema = z.object({
  id: z.string().uuid(),
  defaultAllowance: z.number().min(0).optional(),
  carryForward: z.boolean().optional(),
  maxCarryForward: z.number().min(0).optional(),
});

export type CreateLeaveRequest = z.infer<typeof createLeaveRequestSchema>;
export type UpdateLeaveRequest = z.infer<typeof updateLeaveRequestSchema>;
export type UpdateLeaveStatus = z.infer<typeof updateLeaveStatusSchema>;
export type ApproveRejectLeave = z.infer<typeof approveRejectLeaveSchema>;
export type LeaveRequestList = z.infer<typeof leaveRequestListSchema>;
export type LeaveFilters = z.infer<typeof leaveFiltersSchema>;
export type LeaveBalance = z.infer<typeof leaveBalanceSchema>;
export type CreateLeavePolicy = z.infer<typeof createLeavePolicySchema>;
export type UpdateLeavePolicy = z.infer<typeof updateLeavePolicySchema>;
