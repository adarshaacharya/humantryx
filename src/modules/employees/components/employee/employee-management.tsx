"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table/data-table";
import { AlertCircle } from "lucide-react";
import { api } from "@/trpc/react";
import { authClient } from "@/server/auth/auth-client";

import { employeeColumns } from "./employee-table-columns";
import { EmployeeFilters } from "./employee-filters";
import { EmployeeEditDialog } from "./employee-edit-dialog";
import { EmployeeDeleteDialog } from "./employee-delete-dialog";
import { EmployeeDetailsDialog } from "./employee-details-dialog";

import type {
  EmployeeFilters as IEmployeeFilters,
} from "../../types/employee.types";
import { useDebounce } from "@/hooks/use-debounce";
import type { EmployeeWithUser } from "@/server/api/types/employee.types";

const DEFAULT_FILTERS: IEmployeeFilters = {
  search: undefined,
  status: undefined,
  sortBy: "createdAt",
  sortDirection: "desc",
};

const PAGE_SIZE = 10;

export function EmployeeManagement() {
  const [filters, setFilters] = useState<IEmployeeFilters>(DEFAULT_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeWithUser | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const [pendingActionId, setPendingActionId] = useState<string | undefined>();

  const debouncedSearch = useDebounce(filters.search, 300);
  const utils = api.useUtils();

  const { data: session } = authClient.useSession();
  const organizationId = session?.session?.activeOrganizationId;

  const employeesQuery = api.employee.list.useQuery(
    {
      organizationId: organizationId ?? "",
      limit: PAGE_SIZE,
      offset: (currentPage - 1) * PAGE_SIZE,
      searchQuery: debouncedSearch,
      status: filters.status,
      sortBy: filters.sortBy,
      sortDirection: filters.sortDirection,
    },
    {
      enabled: !!organizationId,
    },
  );

  // Event handlers
  const handleFiltersChange = useCallback((newFilters: IEmployeeFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const handleRefresh = useCallback(() => {
    void employeesQuery.refetch();
  }, [employeesQuery]);

  const handleViewEmployee = useCallback((employee: EmployeeWithUser) => {
    setSelectedEmployee(employee);
    setDetailsDialogOpen(true);
  }, []);

  const handleEditEmployee = useCallback((employee: EmployeeWithUser) => {
    setSelectedEmployee(employee);
    setEditDialogOpen(true);
  }, []);

  const handleDeleteEmployee = useCallback((employee: EmployeeWithUser) => {
    setSelectedEmployee(employee);
    setDeleteDialogOpen(true);
  }, []);

  const handleInviteSent = useCallback(() => {
    void utils.employee.list.invalidate();
  }, [utils.employee.list]);

  if (!organizationId) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="space-y-2 text-center">
            <AlertCircle className="text-muted-foreground mx-auto h-8 w-8" />
            <p className="text-muted-foreground">No organization selected</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (employeesQuery.error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="space-y-4 text-center">
            <AlertCircle className="text-destructive mx-auto h-8 w-8" />
            <div>
              <p className="text-destructive font-medium">
                Error loading employees
              </p>
              <p className="text-muted-foreground text-sm">
                {employeesQuery.error.message}
              </p>
            </div>
            <Button variant="outline" onClick={() => employeesQuery.refetch()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const employees = employeesQuery.data?.employees ?? [];
  const pagination = employeesQuery.data?.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Employee Management
          </h1>
          <p className="text-muted-foreground">
            Manage your organization&apos;s employees, invitations, and
            permissions
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>
            Search and filter employees by name, designation, or status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onRefresh={handleRefresh}
            isLoading={employeesQuery.isLoading}
          />
        </CardContent>
      </Card>

      {/* Employee Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employees</CardTitle>
          <CardDescription>
            {pagination
              ? `Showing ${employees.length} of ${pagination.totalCount} employees`
              : "Loading employees..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={employeeColumns}
            data={employees}
            meta={{
              onViewEmployee: handleViewEmployee,
              onEditEmployee: handleEditEmployee,
              onDeleteEmployee: handleDeleteEmployee,
              pendingActionId,
              setPendingActionId,
            }}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <EmployeeDetailsDialog
        employee={selectedEmployee}
        isOpen={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        onEditEmployee={handleEditEmployee}
      />

      <EmployeeEditDialog
        employee={selectedEmployee}
        isOpen={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onEmployeeUpdated={handleInviteSent}
      />

      <EmployeeDeleteDialog
        employee={selectedEmployee}
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onEmployeeDeleted={handleInviteSent}
      />
    </div>
  );
}
