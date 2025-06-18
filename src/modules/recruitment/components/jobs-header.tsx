"use client";

import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateJobDialog } from "../postings/upsert-job/create-job-dialog";
import { JOB_STATUSES } from "../consts";
import { EMPLOYEE_DEPARTMENTS } from "@/server/db/consts";

interface JobsHeaderProps {
  onSearch?: (search: string) => void;
  onStatusFilter?: (status: string) => void;
  onDepartmentFilter?: (department: string) => void;
}

export function JobsHeader({
  onSearch,
  onStatusFilter,
  onDepartmentFilter,
}: JobsHeaderProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Job Postings</h1>
        <p className="text-muted-foreground">
          Manage your job postings and track applications
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search jobs..."
            className="w-full pl-10 sm:w-64"
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Select
            onValueChange={(value) =>
              onStatusFilter?.(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-32">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {JOB_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            onValueChange={(value) =>
              onDepartmentFilter?.(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {EMPLOYEE_DEPARTMENTS.map((dept) => (
                <SelectItem key={dept.value} value={dept.value}>
                  {dept.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Create Job Button */}
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Job
        </Button>
      </div>

      <CreateJobDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}
