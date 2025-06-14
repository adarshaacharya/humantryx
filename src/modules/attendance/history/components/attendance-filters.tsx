"use client";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, Search, Download } from "lucide-react";
import { format, subDays } from "date-fns";
import { cn } from "@/lib/utils";
import { type DateRange } from "react-day-picker";

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

type AttendanceFiltersProps = {
  employeeFilter: string;
  setEmployeeFilter: (value: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  showEmployeeFilter?: boolean;
  showSearch?: boolean;
  onExport?: () => void;
};

export function AttendanceFilters({
  employeeFilter,
  setEmployeeFilter,
  dateRange,
  setDateRange,
  searchTerm,
  setSearchTerm,
  showEmployeeFilter = true,
  showSearch = true,
  onExport,
}: AttendanceFiltersProps) {
  // Get all employees for filter dropdown
  const employeesQuery = api.employee.list.useQuery(
    {
      limit: 100,
      offset: 0,
    },
    {
      enabled: showEmployeeFilter,
    },
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          {showSearch && (
            <div className="flex items-center gap-2">
              <Search className="text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          )}

          {/* Employee Filter */}
          {showEmployeeFilter && (
            <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Employees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {employeesQuery.data?.employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.user?.name ?? "Unknown"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Date Range Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-72 justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="flex">
                <div className="flex flex-col gap-2 border-r p-3">
                  <Label className="text-sm font-medium">Presets</Label>
                  {presetRanges.map((preset) => (
                    <Button
                      key={preset.label}
                      variant="ghost"
                      size="sm"
                      className="justify-start"
                      onClick={() => setDateRange(preset.range())}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
                <Calendar
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Export Button */}
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        )}
      </div>
    </div>
  );
}
