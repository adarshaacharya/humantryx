"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Settings, DollarSign, Search, Plus, Edit } from "lucide-react";
import { useAbility } from "@/providers/ability-context";
import { SetSalaryDialog } from "./set-salary-dialog";
// Note: EmployeeSalaryView is for individual employee view, not suitable for this use case
import type { ColumnDef } from "@tanstack/react-table";
import { startCase } from "lodash-es";

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};

interface EmployeeWithSalary {
  id: string;
  userId: string | null;
  organizationId: string;
  designation: string;
  status: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  } | null;
  salarySettings: {
    id: string;
    employeeId: string;
    baseSalary: string;
    currency: string;
    taxPercentage: string | null;
    customTaxAmount: string | null;
    allowances: string | null;
    isActive: boolean;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
  } | null;
}

export function SalarySettingsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [setSalaryDialogOpen, setSetsalaryDialogOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null,
  );

  const ability = useAbility();
  const utils = api.useUtils();

  const employeesWithSalaryQuery =
    api.payroll.getEmployeesWithSalarySettings.useQuery();

  const employees = employeesWithSalaryQuery.data || [];

  // Filter employees based on search term
  const filteredEmployees = employees.filter(
    (employee) =>
      employee.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.designation.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSetSalary = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    setSetsalaryDialogOpen(true);
  };

  const columns: ColumnDef<EmployeeWithSalary>[] = [
    {
      accessorKey: "name",
      header: "Employee",
      cell: ({ row }) => {
        const employee = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{employee.user?.name || "N/A"}</span>
            <span className="text-muted-foreground text-sm">
              {employee.user?.email || "N/A"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "designation",
      header: "Position",
      cell: ({ row }) => {
        const employee = row.original;
        return (
          <div className="flex flex-col">
            <span>{startCase(employee.designation)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "salarySettings",
      header: "Salary Information",
      cell: ({ row }) => {
        const employee = row.original;
        const salary = employee.salarySettings;

        if (!salary) {
          return (
            <Badge variant="outline" className="text-orange-600">
              Not Set
            </Badge>
          );
        }

        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {formatCurrency(parseFloat(salary.baseSalary), salary.currency)}
            </span>
            {parseFloat(salary.allowances || "0") > 0 && (
              <span className="text-muted-foreground text-sm">
                +
                {formatCurrency(
                  parseFloat(salary.allowances || "0"),
                  salary.currency,
                )}{" "}
                allowances
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "taxPercentage",
      header: "Tax Percentage",
      cell: ({ row }) => {
        const employee = row.original;
        const salary = employee.salarySettings;

        if (!salary?.taxPercentage) {
          return <span className="text-muted-foreground">N/A</span>;
        }

        return (
          <div className="flex flex-col">
            <span>{salary.taxPercentage}%</span>
            {salary.customTaxAmount && (
              <span className="text-muted-foreground text-sm">
                Custom:{" "}
                {formatCurrency(
                  parseFloat(salary.customTaxAmount),
                  salary.currency,
                )}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const employee = row.original;
        const salary = employee.salarySettings;

        if (!salary) {
          return (
            <Badge variant="secondary" className="text-orange-600">
              Pending Setup
            </Badge>
          );
        }

        return (
          <Badge variant={salary.isActive ? "default" : "secondary"}>
            {salary.isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const employee = row.original;
        const canManageSalary = ability.can("manage", "SalarySettings");

        return (
          <div className="flex items-center gap-2">
            {canManageSalary && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSetSalary(employee.id)}
              >
                {employee.salarySettings ? (
                  <Edit className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  // Calculate summary stats
  const totalEmployees = employees.length;
  const employeesWithSalary = employees.filter(
    (emp) => emp.salarySettings,
  ).length;
  const pendingSetup = totalEmployees - employeesWithSalary;
  const totalPayroll = employees
    .filter((emp) => emp.salarySettings?.isActive)
    .reduce((sum, emp) => {
      if (emp.salarySettings) {
        return (
          sum +
          parseFloat(emp.salarySettings.baseSalary) +
          parseFloat(emp.salarySettings.allowances || "0")
        );
      }
      return sum;
    }, 0);

  if (employeesWithSalaryQuery.isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="bg-muted h-4 w-20 animate-pulse rounded" />
                <div className="bg-muted h-4 w-4 animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="bg-muted mb-1 h-8 w-16 animate-pulse rounded" />
                <div className="bg-muted h-3 w-24 animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <div className="bg-muted h-6 w-48 animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-muted h-12 w-full animate-pulse rounded"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Employees
            </CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-muted-foreground text-xs">
              Active employees in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Salary Configured
            </CardTitle>
            <Settings className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeesWithSalary}</div>
            <p className="text-muted-foreground text-xs">
              Out of {totalEmployees} employees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Setup</CardTitle>
            <Badge variant="outline" className="h-4 w-4 p-0">
              !
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {pendingSetup}
            </div>
            <p className="text-muted-foreground text-xs">
              Require salary configuration
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Payroll
            </CardTitle>
            <DollarSign className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalPayroll, "USD")}
            </div>
            <p className="text-muted-foreground text-xs">
              Total active payroll
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Employee Salary Settings Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Employee Salary Settings</CardTitle>
              <CardDescription>
                Manage salary configurations for all employees
              </CardDescription>
            </div>
          </div>

          {/* Search Filter */}
          <div className="flex items-center space-x-2">
            <div className="relative max-w-sm flex-1">
              <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={filteredEmployees} />
        </CardContent>
      </Card>

      {/* Dialogs */}
      {selectedEmployeeId && (
        <SetSalaryDialog
          open={setSalaryDialogOpen}
          onOpenChange={(open) => {
            setSetsalaryDialogOpen(open);
            if (!open) {
              setSelectedEmployeeId(null);
              void utils.payroll.getEmployeesWithSalarySettings.invalidate();
            }
          }}
        />
      )}
    </div>
  );
}
