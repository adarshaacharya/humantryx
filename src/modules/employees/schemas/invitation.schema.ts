import { z } from "zod";

// Invitation filters schema
export const invitationFiltersSchema = z.object({
  search: z.string().optional(),
  status: z
    .enum(["all", "pending", "accepted", "canceled", "expired"])
    .default("all"),
  sortBy: z
    .enum(["email", "status", "createdAt", "expiresAt"])
    .default("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
  organizationId: z.string().min(1, "Organization ID is required"),
});

// Invitation list query schema
export const invitationListSchema = z.object({
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
  searchQuery: z.string().optional(),
  status: z
    .enum(["all", "pending", "accepted", "canceled", "expired"])
    .default("all"),
  sortBy: z
    .enum(["email", "status", "createdAt", "expiresAt"])
    .default("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
  organizationId: z.string().min(1, "Organization ID is required"),
});

// Cancel invitation schema
export const cancelInvitationByIdSchema = z.object({
  invitationId: z.string().min(1, "Invitation ID is required"),
  organizationId: z.string().min(1, "Organization ID is required"),
});

// Resend invitation schema
export const resendInvitationByIdSchema = z.object({
  invitationId: z.string().min(1, "Invitation ID is required"),
  organizationId: z.string().min(1, "Organization ID is required"),
});

// Get invitation details schema
export const invitationByIdSchema = z.object({
  invitationId: z.string().min(1, "Invitation ID is required"),
  organizationId: z.string().min(1, "Organization ID is required"),
});

// Export schema types
export type InvitationFilters = z.infer<typeof invitationFiltersSchema>;
export type InvitationListQuery = z.infer<typeof invitationListSchema>;
export type CancelInvitationById = z.infer<typeof cancelInvitationByIdSchema>;
export type ResendInvitationById = z.infer<typeof resendInvitationByIdSchema>;
export type InvitationById = z.infer<typeof invitationByIdSchema>;
