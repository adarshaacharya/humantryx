"use client";

import { useState, useCallback } from "react";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table/data-table";
import { Clock } from "lucide-react";
import { subDays } from "date-fns";
import { type DateRange } from "react-day-picker";
import { useDebounce } from "@/hooks/use-debounce";

import { attendanceColumns } from "./attendance-columns";
import { AttendanceFilters } from "./attendance-filters";
import { type AttendanceRecord } from "../../types";

const presetRanges = [
  {
    label: "Today",
    range: () => ({
      from: new Date(),
      to: new Date(),
    }),
  },
  {
    label: "Yesterday",
    range: () => ({
      from: subDays(new Date(), 1),
      to: subDays(new Date(), 1),
    }),
  },
  {
    label: "Last 7 Days",
    range: () => ({
      from: subDays(new Date(), 6),
      to: new Date(),
    }),
  },
  {
    label: "Last 30 Days",
    range: () => ({
      from: subDays(new Date(), 29),
      to: new Date(),
    }),
  },
  {
    label: "This Month",
    range: () => {
      const now = new Date();
      return {
        from: new Date(now.getFullYear(), now.getMonth(), 1),
        to: new Date(now.getFullYear(), now.getMonth() + 1, 0),
      };
    },
  },
];

type Props = {
  employeeId?: string;
  showEmployeeFilter?: boolean;
  title?: string;
  description?: string;
};

export function AttendanceDataTable({
  employeeId,
  showEmployeeFilter = true,
  title = "Attendance History",
  description,
}: Props) {
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    presetRanges[2]?.range(),
  );
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Helper function to normalize dates before sending to backend
  const normalizeDateRange = (from?: Date, to?: Date) => {
    if (!from && !to) return { startDate: undefined, endDate: undefined };

    return {
      startDate: from
        ? (() => {
            const normalized = new Date(from);
            normalized.setHours(0, 0, 0, 0);
            return normalized;
          })()
        : undefined,
      endDate: to
        ? (() => {
            const normalized = new Date(to);
            normalized.setHours(23, 59, 59, 999);
            return normalized;
          })()
        : undefined,
    };
  };

  const { startDate, endDate } = normalizeDateRange(
    dateRange?.from,
    dateRange?.to,
  );

  const historyQuery = api.attendance.getHistory.useQuery({
    employeeId:
      employeeId || (employeeFilter === "all" ? undefined : employeeFilter),
    startDate,
    endDate,
  });

  const filteredRecords: AttendanceRecord[] =
    (historyQuery.data?.data as AttendanceRecord[])?.filter((record) => {
      if (!debouncedSearch) return true;
      const employeeName = record.employee?.user?.name?.toLowerCase() ?? "";
      const employeeEmail = record.employee?.user?.email?.toLowerCase() ?? "";
      const search = debouncedSearch.toLowerCase();
      return employeeName.includes(search) || employeeEmail.includes(search);
    }) ?? [];

  const handleViewRecord = useCallback((record: AttendanceRecord) => {
    console.log("View record:", record);
  }, []);

  const handleEditRecord = useCallback((record: AttendanceRecord) => {
    console.log("Edit record:", record);
  }, []);

  const handleExport = useCallback(() => {
    console.log("Export attendance records");
  }, []);

  // Get columns based on whether to show employee info
  const columns = attendanceColumns.filter((column) => {
    if (
      "accessorKey" in column &&
      column.accessorKey === "employee" &&
      !showEmployeeFilter
    ) {
      return false;
    }
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {title}
        </CardTitle>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}

        <AttendanceFilters
          employeeFilter={employeeFilter}
          setEmployeeFilter={setEmployeeFilter}
          dateRange={dateRange}
          setDateRange={setDateRange}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          showEmployeeFilter={showEmployeeFilter && !employeeId}
          showSearch={showEmployeeFilter && !employeeId}
          onExport={handleExport}
        />
      </CardHeader>

      <CardContent>
        <DataTable
          columns={columns}
          data={filteredRecords}
          meta={{
            onViewRecord: handleViewRecord,
            onEditRecord: handleEditRecord,
            showEmployeeInfo: showEmployeeFilter && !employeeId,
          }}
        />
      </CardContent>
    </Card>
  );
}
