"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  User,
  Calendar,
  Crown,
  Shield,
  UserCheck,
} from "lucide-react";
import { authClient, useSession } from "@/server/auth/auth-client";
import { getRoleBadgeVariant, getRoleIcon } from "./utils";
import { useAbility } from "@/providers/ability-context";
import { useCurrentEmployee } from "@/hooks/use-current-employee";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { startCase } from "lodash-es";

export function PersonalDetails() {
  const currentOrg = authClient.useActiveOrganization();
  const currentMember = authClient.useActiveMember();
  const ability = useAbility();
  const employee = useCurrentEmployee();
  const { data: session } = useSession();

  const canManageMember = ability.can("manage", "Member");

  if (currentOrg.isPending || currentMember.isPending) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Building2 className="mx-auto h-12 w-12 animate-pulse text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-foreground">
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
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-foreground">Error</h3>
            <p className="mt-1 text-sm text-muted-foreground">
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
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium text-foreground">
              No organization found
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
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
                  {session?.user?.image ? (
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={session?.user?.image} />
                      <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
                        {session?.user?.name?.charAt(0) ?? "-"}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-foreground truncate text-lg font-semibold">
                      {employee.user?.name || "Unknown User"}
                    </h3>
                    <p className="text-muted-foreground mb-3 truncate text-sm">
                      {employee.user?.email}
                    </p>
                    <div className="mb-3 flex items-center space-x-2">
                      <Badge
                        variant="secondary"
                        className="text-xs"
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
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Joined{" "}
                          {employee.createdAt
                            ? format(new Date(employee.createdAt), "MMM yyyy")
                            : "Recently"}
                        </span>
                      </div>
                      {employee.department && (
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span className="truncate">
                            Department: {startCase(employee.department)}
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
              <h4 className="text-sm font-medium text-foreground">
                Your Journey
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border bg-muted/50 p-3 text-center">
                  <div className="text-xl font-bold text-foreground">
                    {employee?.createdAt
                      ? Math.floor(
                          (Date.now() -
                            new Date(employee.createdAt).getTime()) /
                            (1000 * 60 * 60 * 24 * 30),
                        )
                      : 0}
                  </div>
                  <div className="text-xs font-medium text-muted-foreground">
                    Months Here
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/50 p-3 text-center">
                  <div className="truncate text-sm font-bold text-foreground">
                    {employee?.department
                      ? employee.department
                          .split("_")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1),
                          )
                          .join(" ")
                      : "-"}
                  </div>
                  <div className="text-xs font-medium text-muted-foreground">
                    Your Department
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
                <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-muted">
                  <Building2 className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">
                    {currentOrg.data.name}
                  </h3>
                  {currentOrg.data.slug && (
                    <p className="mt-1 inline-block rounded bg-muted px-2 py-1 font-mono text-sm text-muted-foreground">
                      {currentOrg.data.slug}
                    </p>
                  )}
                  <div className="mt-2 flex items-center space-x-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Established{" "}
                      {format(new Date(currentOrg.data.createdAt), "MMMM yyyy")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Organization Stats */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">
                Company Overview
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border bg-muted/50 p-3 text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {members.length}
                  </div>
                  <div className="text-xs font-medium text-muted-foreground">
                    Total Members
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/50 p-3 text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {Math.ceil(
                      (Date.now() -
                        new Date(currentOrg.data.createdAt).getTime()) /
                        (1000 * 60 * 60 * 24 * 30),
                    )}
                  </div>
                  <div className="text-xs font-medium text-muted-foreground">
                    Months Active
                  </div>
                </div>
              </div>
            </div>

            {/* Team Composition (for admins) or Access Level (for employees) */}
            {canManageMember ? (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">
                  Team Composition
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg border bg-muted/50 p-2 text-center">
                    <div className="text-lg font-bold text-foreground">
                      {members.filter((m) => m.role === "admin").length}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Admin
                      {members.filter((m) => m.role === "admin").length !== 1
                        ? "s"
                        : ""}
                    </div>
                  </div>
                  <div className="rounded-lg border bg-muted/50 p-2 text-center">
                    <div className="text-lg font-bold text-foreground">
                      {members.filter((m) => m.role === "member").length}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Member
                      {members.filter((m) => m.role === "member").length !== 1
                        ? "s"
                        : ""}
                    </div>
                  </div>
                  <div className="rounded-lg border bg-muted/50 p-2 text-center">
                    <div className="text-lg font-bold text-foreground">
                      {members.filter((m) => m.role === "owner").length}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Owner
                      {members.filter((m) => m.role === "owner").length !== 1
                        ? "s"
                        : ""}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
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
              <h4 className="flex items-center space-x-2 text-sm font-medium text-foreground">
                <UserCheck className="h-4 w-4" />
                <span>Recent Members</span>
              </h4>
              <div className="grid gap-3 md:grid-cols-2">
                {members.slice(0, 6).map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg border bg-muted/30 p-3"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-muted">
                        <span className="text-xs font-semibold text-muted-foreground">
                          {member.user.name?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {member.user.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
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
                  <p className="rounded-lg bg-muted py-2 text-xs text-muted-foreground">
                    +{members.length - 6} more member
                    {members.length - 6 !== 1 ? "s" : ""}
                  </p>
                </div>
              )}

              {members.length === 0 && (
                <div className="py-6 text-center">
                  <Users className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">No members found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
