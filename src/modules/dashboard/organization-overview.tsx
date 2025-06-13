"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Settings, User } from "lucide-react";
import { authClient } from "@/server/auth/auth-client";
import { getRoleBadgeVariant, getRoleIcon } from "./utils";
import { useAbility } from "@/providers/ability-context";
import { TeamOverviewCard } from "./team-overview-card";

export function OrganizationOverview() {
  const currentOrg = authClient.useActiveOrganization();
  const currentMember = authClient.useActiveMember();
  const ability = useAbility();

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Organization</h2>
          <p className="text-gray-600">
            Manage your organization settings and members
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Organization Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Organization Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{currentOrg.data.name}</h3>
              {currentOrg.data.slug && (
                <p className="text-sm text-gray-600">
                  Slug: {currentOrg.data.slug}
                </p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Your role:</span>
              <Badge
                variant={getRoleBadgeVariant(currentMember.data?.role ?? "-")}
              >
                <div className="flex items-center space-x-1">
                  {getRoleIcon(currentMember.data?.role ?? "")}
                  <span className="capitalize">
                    {currentMember.data?.role ?? ""}
                  </span>
                </div>
              </Badge>
            </div>
            <div className="text-sm text-gray-600">
              Created:{" "}
              {new Date(currentOrg.data.createdAt).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>

        {/* Members List */}
        {canManageMember ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Members</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Members:</span>
                  <span className="font-semibold">{members.length}</span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900">
                    Recent Members
                  </h4>
                  <div className="space-y-2">
                    {members.slice(0, 3).map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200">
                            <User className="h-3 w-3 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {member.user.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {member.user.email}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={getRoleBadgeVariant(member.role)}
                          className="text-xs"
                        >
                          {member.role}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  {members.length > 3 && (
                    <p className="text-xs text-gray-500">
                      +{members.length - 3} more members
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <TeamOverviewCard
            organizationName={currentOrg.data.name}
            memberCount={members.length}
          />
        )}
      </div>
    </div>
  );
}
