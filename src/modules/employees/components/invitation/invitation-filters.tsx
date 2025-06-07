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
import type { InvitationFilters } from "../../types/invitation.types";
import {
  INVITATION_STATUS_OPTIONS,
  INVITATION_SORT_OPTIONS,
} from "../../constants/invitation.constants";
import type { InvitationStatus } from "better-auth/plugins";

interface InvitationFiltersProps {
  filters: InvitationFilters;
  onFiltersChange: (filters: InvitationFilters) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function InvitationFilters({
  filters,
  onFiltersChange,
  onRefresh,
  isLoading,
}: InvitationFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      search: value || undefined,
    });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === "all" ? "all" : (value as InvitationStatus & "all"),
    });
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortDirection] = value.split("-") as [
      "email" | "status" | "createdAt" | "expiresAt",
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
            placeholder="Search invitations..."
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
            {INVITATION_STATUS_OPTIONS.map((option) => (
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
            {INVITATION_SORT_OPTIONS.map((option) => (
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
