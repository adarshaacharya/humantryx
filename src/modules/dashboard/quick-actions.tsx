"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Clock,
  DollarSign,
  Calendar,
  FileText,
  BarChart3,
  UserPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAbility } from "@/providers/ability-context";

export function QuickActions() {
  const router = useRouter();
  const ability = useAbility();

  const handleActionClick = (route: string) => {
    router.push(route);
  };

  // Define actions based on user abilities
  const actions = [
    ...(ability.can("manage", "Employee")
      ? [
          {
            icon: UserPlus,
            title: "Invite Employee",
            description: "Onboard new team member",
            route: "/dashboard/employees",
            onClick: () => handleActionClick("/employees"),
          },
          {
            icon: Users,
            title: "Manage Employees",
            description: "View and manage staff",
            route: "/dashboard/employees",
            onClick: () => handleActionClick("/employees"),
          },
        ]
      : []),

    // Payroll management (HR and Admin)
    ...(ability.can("manage", "Payroll") || ability.can("create", "Payroll")
      ? [
          {
            icon: DollarSign,
            title: "Process Payroll",
            description: "Generate monthly payroll",
            route: "/dashboard/payroll",
            onClick: () => handleActionClick("/payroll"),
          },
        ]
      : []),

    // Leave management (HR, Admin, and Project Managers)
    ...(ability.can("manage", "LeaveRequests") ||
    ability.can("update", "LeaveRequests")
      ? [
          {
            icon: Calendar,
            title: "Approve Leaves",
            description: "Review pending requests",
            route: "/leaves",
            onClick: () => handleActionClick("/leaves"),
          },
        ]
      : []),

    // Attendance management (available to most roles)
    ...(ability.can("create", "Attendance") || ability.can("read", "Attendance")
      ? [
          {
            icon: Clock,
            title: "Mark Attendance",
            description: "Record daily attendance",
            route: "/dashboard/attendance",
            onClick: () => handleActionClick("/attendance"),
          },
        ]
      : []),

    // Employee-specific actions
    ...(!ability.can("manage", "Employee") && !ability.can("update", "Employee")
      ? [
          {
            icon: FileText,
            title: "Request Leave",
            description: "Apply for time off",
            route: "/leaves/request",
            onClick: () => handleActionClick("/leaves/request"),
          },
          {
            icon: Clock,
            title: "My Attendance",
            description: "View your attendance",
            route: "/attendance/my",
            onClick: () => handleActionClick("/attendance/my"),
          },
          {
            icon: DollarSign,
            title: "My Payslips",
            description: "View salary details",
            route: "/payroll/my",
            onClick: () => handleActionClick("/payroll/my"),
          },
        ]
      : []),

    // Analytics for managers and above
    ...(ability.can("update", "Employee") || ability.can("manage", "Employee")
      ? [
          {
            icon: BarChart3,
            title: "Analytics",
            description: "View team insights",
            route: "/analytics",
            onClick: () => handleActionClick("/analytics"),
          },
        ]
      : []),
  ];

  // Show only first 4 actions to maintain layout
  const displayedActions = actions.slice(0, 4);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          {ability.can("manage", "Employee")
            ? "HR management tasks"
            : ability.can("update", "Employee")
              ? "Team management tasks"
              : "Your personal tasks"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {displayedActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <div
                key={index}
                onClick={action.onClick}
                className="hover:bg-muted/50 flex cursor-pointer items-center space-x-3 rounded-lg border p-3 transition-colors"
              >
                <IconComponent className="text-primary h-8 w-8" />
                <div>
                  <p className="font-medium">{action.title}</p>
                  <p className="text-muted-foreground text-sm">
                    {action.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        {actions.length === 0 && (
          <div className="text-muted-foreground py-8 text-center">
            <p>No quick actions available</p>
            <p className="text-sm">Contact your administrator for access</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
