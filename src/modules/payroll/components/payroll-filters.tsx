"use client";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw } from "lucide-react";
import { authClient } from "@/server/auth/auth-client";
import type { PayrollFilters as IPayrollFilters } from "../types";
import { PAYMENT_STATUSES, MONTHS, YEARS } from "../constants";

interface PayrollFiltersProps {
  filters: IPayrollFilters;
  onFiltersChange: (filters: IPayrollFilters) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function PayrollFilters({
  filters,
  onFiltersChange,
  onRefresh,
  isLoading,
}: PayrollFiltersProps) {
  const { data: session } = authClient.useSession();
  const organizationId = session?.session?.activeOrganizationId;

  // Fetch employees for filter dropdown
  const employeesQuery = api.payroll.getEmployeesWithSalarySettings.useQuery(
    undefined,
    { enabled: !!organizationId },
  );

  const employees = employeesQuery.data ?? [];

  const handleFilterChange = (
    key: keyof IPayrollFilters,
    value: string | number | undefined,
  ) => {
    const newFilters = { ...filters };

    if (value === "all" || value === "") {
      delete newFilters[key];
    } else {
      // @ts-expect-error - we know the types are compatible
      newFilters[key] = value;
    }

    onFiltersChange(newFilters);
  };

  const handleMonthYearChange = (monthYear: string) => {
    if (monthYear === "all") {
      const newFilters = { ...filters };
      delete newFilters.payrollMonth;
      onFiltersChange(newFilters);
    } else {
      handleFilterChange("payrollMonth", monthYear);
    }
  };

  return (
    <div className="flex flex-wrap items-end gap-4">
      {/* Employee Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Employee</label>
        <Select
          value={filters.employeeId || "all"}
          onValueChange={(value) => handleFilterChange("employeeId", value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All employees" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All employees</SelectItem>
            {employees.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.user?.name ?? "Invited Employee"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Month Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Month</label>
        <Select
          value={filters.payrollMonth || "all"}
          onValueChange={handleMonthYearChange}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All months" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All months</SelectItem>
            {MONTHS.map((month) => (
              <SelectItem
                key={`2025-${month.value}`}
                value={`2025-${month.value}`}
              >
                {month.label} 2025
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Year Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Year</label>
        <Select
          value={filters.year?.toString() || "all"}
          onValueChange={(value) =>
            handleFilterChange(
              "year",
              value === "all" ? undefined : parseInt(value),
            )
          }
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="All years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All years</SelectItem>
            {YEARS.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Status</label>
        <Select
          value={filters.status || "all"}
          onValueChange={(value) => handleFilterChange("status", value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {PAYMENT_STATUSES.map((status) => {
              const StatusIcon = status.icon;
              return (
                <SelectItem key={status.value} value={status.value}>
                  <div className="flex items-center gap-2">
                    <StatusIcon className="h-4 w-4" />
                    <span>{status.label}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Refresh Button */}
      <Button
        variant="outline"
        size="default"
        onClick={onRefresh}
        disabled={isLoading}
        className="shrink-0"
      >
        <RefreshCw
          className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
        />
        Refresh
      </Button>
    </div>
  );
}
