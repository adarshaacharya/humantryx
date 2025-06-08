"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EmployeeFilters } from "../../types/employee.types";

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "invited", label: "Invited" },
] as const;

const SORT_OPTIONS = [
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "designation-asc", label: "Designation (A-Z)" },
  { value: "designation-desc", label: "Designation (Z-A)" },
  { value: "createdAt-desc", label: "Newest First" },
  { value: "createdAt-asc", label: "Oldest First" },
  { value: "email-asc", label: "Email (A-Z)" },
  { value: "email-desc", label: "Email (Z-A)" },
] as const;

interface EmployeeFiltersProps {
  filters: EmployeeFilters;
  onFiltersChange: (filters: EmployeeFilters) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function EmployeeFilters({
  filters,
  onFiltersChange,
  onRefresh,
  isLoading,
}: EmployeeFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      search: value || undefined,
    });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === "all" ? undefined : (value as "active" | "invited"),
    });
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortDirection] = value.split("-") as [
      "name" | "designation" | "createdAt" | "email",
      "asc" | "desc",
    ];
    onFiltersChange({
      ...filters,
      sortBy,
      sortDirection,
    });
  };

  const getSortValue = () => {
    return `${filters.sortBy ?? "createdAt"}-${filters.sortDirection ?? "desc"}`;
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search employees..."
            value={filters.search ?? ""}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={filters.status ?? "all"}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={getSortValue()} onValueChange={handleSortChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isLoading}
      >
        <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
        <span className="sr-only ml-2">Refresh</span>
      </Button>
    </div>
  );
}
