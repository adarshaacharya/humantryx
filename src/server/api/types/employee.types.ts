import type {
  EmployeeDepartment,
  EmployeeDesignation,
  EmployeeStatus,
} from "@/server/db/consts";
import type { PaginationOptions } from "@/types/table";

export interface SortOptions {
  sortBy: "name" | "designation" | "createdAt" | "email";
  sortDirection: "asc" | "desc";
}

export interface FilterOptions {
  searchQuery?: string;
  designation?: string;
  status?: "active" | "invited" | "all";
}

export interface EmployeeListParams
  extends PaginationOptions,
    SortOptions,
    FilterOptions {
  organizationId?: string | null;
}

export interface EmployeeWithUser {
  id: string;
  designation: EmployeeDesignation;
  department: EmployeeDepartment;
  createdAt: Date;
  updatedAt: Date | null;
  organizationId: string;
  userId: string | null;
  memberId: string | null;
  invitationId: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
  status: EmployeeStatus | null;
}
