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

// Frontend-specific types
export type EmployeeStatus = z.infer<typeof employeeStatusEnum> | "all";
export type EmployeeSortBy = z.infer<typeof employeeSortByEnum>;
export type EmployeeFilters = z.infer<typeof employeeFilterSchema>;
export type EmployeePaginationInfo = z.infer<typeof employeePaginationSchema>;

// Action types for table operations
export type EmployeeAction = "view" | "edit" | "delete" | "revoke" | "resend";
