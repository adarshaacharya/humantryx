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
import { Search, RefreshCw, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

const LEAVE_TYPES = [
  { value: "all", label: "All Types" },
  { value: "annual", label: "Annual Leave" },
  { value: "sick", label: "Sick Leave" },
  { value: "casual", label: "Casual Leave" },
  { value: "maternity", label: "Maternity Leave" },
  { value: "paternity", label: "Paternity Leave" },
  { value: "emergency", label: "Emergency Leave" },
] as const;

const LEAVE_STATUSES = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export interface LeaveFilters {
  search?: string;
  status?: string;
  leaveType?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

interface LeaveFiltersComponentProps {
  filters: LeaveFilters;
  onFiltersChange: (filters: LeaveFilters) => void;
  onRefresh: () => void;
  isLoading?: boolean;
  showStatusFilter?: boolean;
  showTypeFilter?: boolean;
}

export function LeaveFiltersComponent({
  filters,
  onFiltersChange,
  onRefresh,
  isLoading = false,
  showStatusFilter = true,
  showTypeFilter = true,
}: LeaveFiltersComponentProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      search: value || undefined,
    });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === "all" ? undefined : value,
    });
  };

  const handleTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      leaveType: value === "all" ? undefined : value,
    });
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortDirection] = value.split("-");
    onFiltersChange({
      ...filters,
      sortBy,
      sortDirection: sortDirection as "asc" | "desc",
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: undefined,
      status: undefined,
      leaveType: undefined,
      sortBy: "createdAt",
      sortDirection: "desc",
    });
  };

  const hasActiveFilters =
    filters.search || filters.status || filters.leaveType;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
              <Input
                placeholder="Search leaves..."
                value={filters.search ?? ""}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Status Filter */}
            {showStatusFilter && (
              <Select
                value={filters.status ?? "all"}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {LEAVE_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Type Filter */}
            {showTypeFilter && (
              <Select
                value={filters.leaveType ?? "all"}
                onValueChange={handleTypeChange}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {LEAVE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Sort */}
            <Select
              value={`${filters.sortBy ?? "createdAt"}-${filters.sortDirection ?? "desc"}`}
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">Newest First</SelectItem>
                <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                <SelectItem value="startDate-desc">
                  Start Date (Latest)
                </SelectItem>
                <SelectItem value="startDate-asc">
                  Start Date (Earliest)
                </SelectItem>
                <SelectItem value="totalDays-desc">
                  Duration (High to Low)
                </SelectItem>
                <SelectItem value="totalDays-asc">
                  Duration (Low to High)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="h-8"
              >
                <Filter className="mr-2 h-3 w-3" />
                Clear
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-8"
            >
              <RefreshCw
                className={cn("mr-2 h-3 w-3", isLoading && "animate-spin")}
              />
              Refresh
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
