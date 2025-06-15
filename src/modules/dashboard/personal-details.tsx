"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  Settings,
  User,
  Calendar,
  Crown,
  Shield,
  UserCheck,
} from "lucide-react";
import { authClient } from "@/server/auth/auth-client";
import { getRoleBadgeVariant, getRoleIcon } from "./utils";
import { useAbility } from "@/providers/ability-context";
import { useCurrentEmployee } from "@/hooks/use-current-employee";
import { format } from "date-fns";

export function PersonalDetails() {
  const currentOrg = authClient.useActiveOrganization();
  const currentMember = authClient.useActiveMember();
  const ability = useAbility();
  const employee = useCurrentEmployee();

  const canManageMember = ability.can("manage", "Member");

  if (currentOrg.isPending || currentMember.isPending) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Building2 className="mx-auto h-12 w-12 animate-pulse text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Loading organization data...
            </h3>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentOrg.error || currentMember.error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Building2 className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-2 text-sm font-medium text-red-900">Error</h3>
            <p className="mt-1 text-sm text-red-500">
              {currentOrg.error?.message}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentOrg.data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No organization found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              You don&apos;t seem to be part of any organization.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const members = currentOrg.data?.members ?? [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Personal Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5" />
              <span>Personal Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current User Profile */}
            {employee && (
              <div className="rounded-lg border bg-gradient-to-r from-indigo-50 to-purple-50 p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-indigo-200 bg-indigo-100">
                    <span className="text-sm font-semibold text-indigo-600">
                      {employee.user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-semibold text-gray-900">
                      {employee.user?.name || "Unknown User"}
                    </h3>
                    <p className="mb-3 truncate text-sm text-gray-600">
                      {employee.user?.email}
                    </p>
                    <div className="mb-3 flex items-center space-x-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          employee.designation === "founder"
                            ? "border-purple-200 bg-purple-100 text-purple-800"
                            : employee.designation === "hr"
                              ? "border-blue-200 bg-blue-100 text-blue-800"
                              : employee.designation === "project_manager"
                                ? "border-green-200 bg-green-100 text-green-800"
                                : "border-gray-200 bg-gray-100 text-gray-800"
                        }`}
                      >
                        {employee.designation === "founder" && (
                          <Crown className="mr-1 h-3 w-3" />
                        )}
                        {employee.designation === "hr" && (
                          <Shield className="mr-1 h-3 w-3" />
                        )}
                        {employee.designation
                          .split("_")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1),
                          )
                          .join(" ")}
                      </Badge>
                      <Badge
                        variant={getRoleBadgeVariant(
                          currentMember.data?.role ?? "-",
                        )}
                        className="text-xs"
                      >
                        <div className="flex items-center space-x-1">
                          {getRoleIcon(currentMember.data?.role ?? "")}
                          <span className="capitalize">
                            {currentMember.data?.role ?? ""}
                          </span>
                        </div>
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Joined{" "}
                          {employee.createdAt
                            ? format(new Date(employee.createdAt), "MMM yyyy")
                            : "Recently"}
                        </span>
                      </div>
                      {employee.department && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <User className="h-3 w-3" />
                          <span className="truncate">
                            Department: {employee.department}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Personal Stats */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">
                Your Journey
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center">
                  <div className="text-xl font-bold text-green-600">
                    {employee?.createdAt
                      ? Math.floor(
                          (Date.now() -
                            new Date(employee.createdAt).getTime()) /
                            (1000 * 60 * 60 * 24 * 30),
                        )
                      : 0}
                  </div>
                  <div className="text-xs font-medium text-gray-600">
                    Months Here
                  </div>
                </div>
                <div className="rounded-lg border border-purple-200 bg-purple-50 p-3 text-center">
                  <div className="truncate text-sm font-bold text-purple-600">
                    {employee?.designation
                      ? employee.designation
                          .split("_")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1),
                          )
                          .join(" ")
                      : "Employee"}
                  </div>
                  <div className="text-xs font-medium text-gray-600">
                    Your Designation
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organization Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Organization Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Organization Header */}
            <div className="rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
              <div className="flex items-start space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-blue-200 bg-blue-100">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {currentOrg.data.name}
                  </h3>
                  {currentOrg.data.slug && (
                    <p className="mt-1 inline-block rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-600">
                      {currentOrg.data.slug}
                    </p>
                  )}
                  <div className="mt-2 flex items-center space-x-1">
                    <Calendar className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-500">
                      Established{" "}
                      {format(new Date(currentOrg.data.createdAt), "MMMM yyyy")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Organization Stats */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">
                Company Overview
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {members.length}
                  </div>
                  <div className="text-xs font-medium text-gray-600">
                    Total Members
                  </div>
                </div>
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.ceil(
                      (Date.now() -
                        new Date(currentOrg.data.createdAt).getTime()) /
                        (1000 * 60 * 60 * 24 * 30),
                    )}
                  </div>
                  <div className="text-xs font-medium text-gray-600">
                    Months Active
                  </div>
                </div>
              </div>
            </div>

            {/* Team Composition (for admins) or Access Level (for employees) */}
            {canManageMember ? (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">
                  Team Composition
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-2 text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {members.filter((m) => m.role === "admin").length}
                    </div>
                    <div className="text-xs text-gray-600">
                      Admin
                      {members.filter((m) => m.role === "admin").length !== 1
                        ? "s"
                        : ""}
                    </div>
                  </div>
                  <div className="rounded-lg border border-green-200 bg-green-50 p-2 text-center">
                    <div className="text-lg font-bold text-green-600">
                      {members.filter((m) => m.role === "member").length}
                    </div>
                    <div className="text-xs text-gray-600">
                      Member
                      {members.filter((m) => m.role === "member").length !== 1
                        ? "s"
                        : ""}
                    </div>
                  </div>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-center">
                    <div className="text-lg font-bold text-amber-600">
                      {members.filter((m) => m.role === "owner").length}
                    </div>
                    <div className="text-xs text-gray-600">
                      Owner
                      {members.filter((m) => m.role === "owner").length !== 1
                        ? "s"
                        : ""}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">
                  Your Access
                </h4>
                <div className="rounded-lg border bg-gray-50 p-3">
                  <div className="text-center">
                    <p className="mb-1 text-sm text-gray-600">
                      You have{" "}
                      <span className="font-semibold text-gray-900">
                        {currentMember.data?.role}
                      </span>{" "}
                      access to
                    </p>
                    <p className="text-lg font-semibold text-blue-600">
                      {currentOrg.data.name}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Team Members (only for admins) */}
      {canManageMember && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Team Members</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {members.length} member{members.length !== 1 ? "s" : ""}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <h4 className="flex items-center space-x-2 text-sm font-medium text-gray-900">
                <UserCheck className="h-4 w-4" />
                <span>Recent Members</span>
              </h4>
              <div className="grid gap-3 md:grid-cols-2">
                {members.slice(0, 6).map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg border bg-gray-50 p-3"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-200 bg-blue-100">
                        <span className="text-xs font-semibold text-blue-600">
                          {member.user.name?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {member.user.name}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                          {member.user.email}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={getRoleBadgeVariant(member.role)}
                      className="text-xs"
                    >
                      <div className="flex items-center space-x-1">
                        {member.role === "owner" && (
                          <Crown className="h-3 w-3" />
                        )}
                        {member.role === "admin" && (
                          <Shield className="h-3 w-3" />
                        )}
                        <span>{member.role}</span>
                      </div>
                    </Badge>
                  </div>
                ))}
              </div>

              {members.length > 6 && (
                <div className="text-center">
                  <p className="rounded-lg bg-gray-100 py-2 text-xs text-gray-500">
                    +{members.length - 6} more member
                    {members.length - 6 !== 1 ? "s" : ""}
                  </p>
                </div>
              )}

              {members.length === 0 && (
                <div className="py-6 text-center">
                  <Users className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No members found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
