"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Clock,
  Calendar as CalendarIcon,
  Search,
  Download,
  User,
  Timer,
  Coffee,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { addDays, format, subDays } from "date-fns";
import { cn } from "@/lib/utils";
import { type DateRange } from "react-day-picker";

type AttendanceRecord = {
  id: string;
  employeeId: string;
  clockInTime: Date;
  clockOutTime: Date | null;
  breakStartTime: Date | null;
  breakEndTime: Date | null;
  totalWorkingMinutes: number | null;
  totalBreakMinutes: number | null;
  status: "clocked_in" | "clocked_out" | "break_start" | "break_end";
  notes: string | null;
  employee: {
    id: string;
    designation: string;
    user: {
      name: string;
      email: string;
    } | null;
  } | null;
};

const statusConfig = {
  clocked_out: {
    label: "Completed",
    color: "bg-green-100 text-green-800",
  },
  clocked_in: {
    label: "Active",
    color: "bg-blue-100 text-blue-800",
  },
  break_start: {
    label: "On Break",
    color: "bg-yellow-100 text-yellow-800",
  },
};

const presetRanges = [
  {
    label: "Today",
    range: () => ({
      from: new Date(),
      to: addDays(new Date()),
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
};
export function AttendanceHistoryTable(
  { employeeId }: Props = { employeeId: undefined },
) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    presetRanges[2]?.range(),
  );
  const [searchTerm, setSearchTerm] = useState("");

  // Get all employees for filter dropdown
  const employeesQuery = api.employee.list.useQuery({
    limit: 100,
    offset: 0,
  });

  // Get attendance history
  const historyQuery = api.attendance.getHistory.useQuery({
    page: currentPage,
    limit: pageSize,
    employeeId: employeeFilter === "all" ? undefined : employeeFilter,
    startDate: dateRange?.from,
    endDate: dateRange?.to,
  });

  // Debug logging
  console.log("Attendance History Query:", {
    data: historyQuery.data,
    isLoading: historyQuery.isLoading,
    isError: historyQuery.isError,
    error: historyQuery.error,
  });

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "0h 0m";
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const filteredRecords =
    historyQuery.data?.data.filter((record) => {
      if (!searchTerm) return true;
      const employeeName = record.employee?.user?.name?.toLowerCase() ?? "";
      const employeeEmail = record.employee?.user?.email?.toLowerCase() ?? "";
      const search = searchTerm.toLowerCase();
      return employeeName.includes(search) ?? employeeEmail.includes(search);
    }) ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Attendance History
          </CardTitle>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          {!employeeId && (
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

          {!employeeId && (
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
      </CardHeader>

      <CardContent>
        {historyQuery.isLoading ? (
          <div className="py-8 text-center">Loading attendance records...</div>
        ) : historyQuery.isError ? (
          <div className="py-8 text-center text-red-600">
            Failed to load attendance records
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Working Time</TableHead>
                    <TableHead>Break Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-muted-foreground py-8 text-center"
                      >
                        No attendance records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((record: AttendanceRecord) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="bg-primary/10 rounded-full p-1">
                              <User className="text-primary h-3 w-3" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {record.employee?.user?.name ?? "Unknown"}
                              </div>
                              <div className="text-muted-foreground text-xs">
                                {record.employee?.user?.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="text-muted-foreground h-3 w-3" />
                            {format(record.clockInTime, "MMM dd, yyyy")}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Timer className="h-3 w-3 text-green-600" />
                            {format(record.clockInTime, "HH:mm")}
                          </div>
                        </TableCell>

                        <TableCell>
                          {record.clockOutTime ? (
                            <div className="flex items-center gap-2">
                              <Timer className="h-3 w-3 text-red-600" />
                              {format(record.clockOutTime, "HH:mm")}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-blue-600" />
                            {formatDuration(record.totalWorkingMinutes)}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Coffee className="h-3 w-3 text-yellow-600" />
                            {formatDuration(record.totalBreakMinutes)}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={
                              statusConfig[
                                record.status as keyof typeof statusConfig
                              ]?.color
                            }
                          >
                            {
                              statusConfig[
                                record.status as keyof typeof statusConfig
                              ]?.label
                            }
                          </Badge>
                        </TableCell>

                        <TableCell>
                          {record.notes ? (
                            <div className="max-w-32 truncate text-sm">
                              {record.notes}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {historyQuery.data?.pagination && (
              <div className="flex items-center justify-between pt-4">
                <div className="text-muted-foreground text-sm">
                  Showing {(currentPage - 1) * pageSize + 1} to{" "}
                  {Math.min(
                    currentPage * pageSize,
                    historyQuery.data.pagination.totalCount,
                  )}{" "}
                  of {historyQuery.data.pagination.totalCount} results
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from(
                      {
                        length: Math.min(
                          5,
                          historyQuery.data.pagination.totalPages,
                        ),
                      },
                      (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        );
                      },
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={
                      currentPage >= historyQuery.data.pagination.totalPages
                    }
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
