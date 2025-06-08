import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/api/root";
import type {
  employeeStatusEnum,
  employeeSortByEnum,
  employeeFilterSchema,
  employeePaginationSchema,
} from "../schemas/employee.schema";
import type { z } from "zod";

type RouterOutputs = inferRouterOutputs<AppRouter>;

// Employee types from API
export type Employee = RouterOutputs["employee"]["list"]["employees"][0];
export type EmployeePagination =
  RouterOutputs["employee"]["list"]["pagination"];

// Define a clean Employee type to work around any type inference issues
export type EmployeeWithUser = {
  id: string;
  name: string;
  designation: string;
  createdAt: Date;
  updatedAt: Date | null;
  organizationId: string;
  userId: string | null;
  memberId: string | null;
  invitationId: string | null;
  status: EmployeeStatus;
  user?: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
};

// Frontend-specific types
export type EmployeeStatus = z.infer<typeof employeeStatusEnum> | "all";
export type EmployeeSortBy = z.infer<typeof employeeSortByEnum>;
export type EmployeeFilters = z.infer<typeof employeeFilterSchema>;
export type EmployeePaginationInfo = z.infer<typeof employeePaginationSchema>;

// Action types for table operations
export type EmployeeAction = "view" | "edit" | "delete" | "revoke" | "resend";
