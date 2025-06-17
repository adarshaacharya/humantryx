import type { InvitationStatus } from "better-auth/plugins";
import type { z } from "zod";
import type {
  invitationFiltersSchema,
  invitationListSchema,
} from "../schemas/invitation.schema";
import type {
  EmployeeDepartment,
  EmployeeDesignation,
} from "@/server/db/consts";

// Base invitation type from Better Auth
export interface InvitationWithDetails {
  id: string;
  email: string;
  status: InvitationStatus;
  role: string | null;
  expiresAt: Date;
  organizationId: string;
  inviterId: string;
  createdAt?: Date;
  updatedAt?: Date;
  // Additional fields from joins
  inviterName?: string | null;
  inviterEmail?: string | null;
  // Employee details if linked
  employeeId?: string | null;
  employeeName?: string | null;
  employeeDesignation?: EmployeeDesignation | null;
  employeeDepartment?: EmployeeDepartment | null;
}

// Frontend-specific types
export type InvitationStatusFilter =
  | "all"
  | "pending"
  | "accepted"
  | "canceled"
  | "expired";
export type InvitationSortBy = "email" | "status" | "createdAt" | "expiresAt";
export type InvitationFilters = z.infer<typeof invitationFiltersSchema>;
export type InvitationListQuery = z.infer<typeof invitationListSchema>;

// Pagination info
export interface InvitationPaginationInfo {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Action types for table operations
export type InvitationAction = "view" | "resend" | "cancel" | "details";
