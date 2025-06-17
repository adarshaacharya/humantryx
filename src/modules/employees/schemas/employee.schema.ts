import {
  EMPLOYEE_DEPARTMENTS,
  type EmployeeDepartment,
} from "@/server/db/consts";
import {
  employeeDepartmentEnum,
  employeeDesignationEnum,
} from "@/server/db/employees";
import { z } from "zod";

// Employee creation schema
export const createEmployeeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  designation: z
    .enum(employeeDesignationEnum.enumValues, {
      errorMap: () => ({ message: "Invalid designation" }),
    })
    .describe("Designation of the employee"),
  department: z
    .enum(employeeDepartmentEnum.enumValues, {
      errorMap: () => ({ message: "Invalid department" }),
    })
    .describe("Department of the employee"),
  organizationId: z.string().min(1, "Organization ID is required"),
  invitationId: z.string().optional(),
  userId: z.string().optional(),
  memberId: z.string().optional(),
  status: z
    .enum(["active", "invited", "terminated", "resigned", "on_leave"])
    .describe("Status of the employee, either 'active' or 'invited'"),
});

// Employee update schema
export const updateEmployeeSchema = z.object({
  id: z.string().min(1, "Employee ID is required"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name is too long")
    .optional(),
  designation: z
    .enum(employeeDesignationEnum.enumValues, {
      errorMap: () => ({ message: "Invalid designation" }),
    })
    .describe("Designation of the employee")
    .optional(),
  department: z
    .enum(employeeDepartmentEnum.enumValues, {
      errorMap: () => ({ message: "Invalid department" }),
    })
    .describe("Department of the employee")
    .optional(),
  userId: z.string().optional(),
  memberId: z.string().optional(),
});

// Employee invitation schema
export const inviteEmployeeSchema = z.object({
  email: z.string().email("Invalid email address"),
  designation: z
    .enum(employeeDesignationEnum.enumValues, {
      errorMap: () => ({ message: "Invalid designation" }),
    })
    .describe("Designation of the employee"),
  organizationId: z.string().min(1, "Organization ID is required"),
  department: z
    .enum(employeeDepartmentEnum.enumValues, {
      errorMap: () => ({ message: "Invalid department" }),
    })
    .describe("Department of the employee"),
});

// Employee list query schema
export const employeeListSchema = z.object({
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
  searchQuery: z.string().optional(),
  designation: z.enum(employeeDesignationEnum.enumValues).optional(),
  status: z.enum(["active", "invited", "all"]).default("all"),
  sortBy: z
    .enum(["name", "designation", "createdAt", "email"])
    .default("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
  organizationId: z.string().optional(),
});

// Employee by ID schema
export const employeeByIdSchema = z.object({
  id: z.string().min(1, "Employee ID is required"),
  organizationId: z.string().min(1, "Organization ID is required"),
});

// Delete employee schema
export const deleteEmployeeSchema = z.object({
  id: z.string().min(1, "Employee ID is required"),
  organizationId: z.string().min(1, "Organization ID is required"),
});

// cancel invitation schema
export const cancelInvitationSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  organizationId: z.string().min(1, "Organization ID is required"),
});

// Resend invitation schema
export const resendInvitationSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  organizationId: z.string().min(1, "Organization ID is required"),
});

// Update after invitation accepted schema
export const updateAfterInvitationSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  memberId: z.string().min(1, "Member ID is required"),
  organizationId: z.string().min(1, "Organization ID is required"),
});

// Get employee by user ID schema
export const getEmployeeByUserIdSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

// TypeScript types for the schemas
export type CreateEmployeeSchemaType = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeSchemaType = z.infer<typeof updateEmployeeSchema>;
export type InviteEmployeeSchemaType = z.infer<typeof inviteEmployeeSchema>;
export type EmployeeListSchemaType = z.infer<typeof employeeListSchema>;
export type EmployeeByIdSchemaType = z.infer<typeof employeeByIdSchema>;
export type DeleteEmployeeSchemaType = z.infer<typeof deleteEmployeeSchema>;
export type cancelInvitationSchemaType = z.infer<typeof cancelInvitationSchema>;
export type ResendInvitationSchemaType = z.infer<typeof resendInvitationSchema>;

// Employee status enum - aligned with backend
export const employeeStatusEnum = z.enum(["active", "invited"]);

// Employee sort options - aligned with backend
export const employeeSortByEnum = z.enum([
  "name",
  "designation",
  "createdAt",
  "email",
]);

// Employee filter schema for frontend
export const employeeFilterSchema = z.object({
  search: z.string().optional(),
  status: employeeStatusEnum.or(z.literal("all")).optional(),
  designation: z.string().optional(),
  sortBy: employeeSortByEnum.optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
});

// Employee pagination schema - aligned with backend response
export const employeePaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  totalCount: z.number().optional(),
  totalPages: z.number().optional(),
  hasNext: z.boolean().optional(),
  hasPrev: z.boolean().optional(),
});
