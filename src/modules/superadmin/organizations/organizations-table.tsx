"use client";

import { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { organizationColumns } from "./organization-columns";
import { DataTable } from "@/components/ui/data-table/data-table";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";

interface OrganizationsTableProps {
  limit?: number;
}

type SortBy = "name" | "createdAt" | "memberCount";
type SortDirection = "asc" | "desc";

export function OrganizationsTable({ limit }: OrganizationsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const utils = api.useUtils();

  const listOrganizationsQuery = api.admin.listOrganizations.useQuery({
    limit: limit ?? 10,
    offset: 0,
    searchQuery: debouncedSearch,
    sortBy: "createdAt" as SortBy,
    sortDirection: "desc" as SortDirection,
  });

  const updateOrganizationStatus =
    api.admin.updateOrganizationStatus.useMutation({
      onSuccess: async () => {
        await utils.admin.listOrganizations.invalidate();
        toast.success("Organization status updated successfully");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  const handleUpdateStatus = useCallback(
    async (id: string, status: "active" | "suspended") => {
      updateOrganizationStatus.mutate({ organizationId: id, status });
    },
    [updateOrganizationStatus],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Filter organizations..."
          className="max-w-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => listOrganizationsQuery.refetch()}
          className="ml-2"
          disabled={listOrganizationsQuery.isLoading}
        >
          <RefreshCw
            className={cn(
              "h-4 w-4",
              listOrganizationsQuery.isLoading && "animate-spin",
            )}
          />
          <span className="sr-only ml-2">Refresh</span>
        </Button>
      </div>

      <DataTable
        columns={organizationColumns}
        data={listOrganizationsQuery.data?.organizations ?? []}
        meta={{
          updateStatus: handleUpdateStatus,
          isUpdating: updateOrganizationStatus.status === "pending",
          pendingStatusChangeId:
            updateOrganizationStatus.variables?.organizationId,
        }}
      />
    </div>
  );
}
