"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Building2, UserX, Shield, Loader2 } from "lucide-react";
import { OrganizationsTable } from "../organizations/organizations-table";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

export function SuperAdminDashboard() {
  const router = useRouter();
  const statsQuery = api.admin.getStats.useQuery();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Welcome, Super Admin</h1>
        <p className="text-muted-foreground">
          Manage and monitor your Humantryx system
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Organizations
            </CardTitle>
            <Building2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            {statsQuery.isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {statsQuery.data?.organizations.total ?? 0}
                </div>
                <p className="text-muted-foreground text-xs">
                  +{statsQuery.data?.organizations.newThisMonth ?? 0} new this
                  month
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            {statsQuery.isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {statsQuery.data?.users.total ?? 0}
                </div>
                <p className="text-muted-foreground text-xs">
                  +{statsQuery.data?.users.newThisMonth ?? 0} this month
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banned Users</CardTitle>
            <UserX className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            {statsQuery.isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {statsQuery.data?.users.banned ?? 0}
                </div>
                <p className="text-muted-foreground text-xs">
                  +{statsQuery.data?.users.bannedThisWeek ?? 0} this week
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Admins</CardTitle>
            <Shield className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            {statsQuery.isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {statsQuery.data?.users.admins ?? 0}
                </div>
                <p className="text-muted-foreground text-xs">
                  {statsQuery.data?.users.adminsChange === 0
                    ? "No change"
                    : (statsQuery.data?.users.adminsChange ?? 0 > 0)
                      ? `+${statsQuery.data?.users.adminsChange} this month`
                      : `${statsQuery.data?.users.adminsChange} this month`}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Organizations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Organizations</CardTitle>
              <CardDescription>
                Latest organizations in your system
              </CardDescription>
            </div>
            <Button onClick={() => router.push("/admin/organizations")}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <OrganizationsTable limit={5} />
        </CardContent>
      </Card>
    </div>
  );
}
