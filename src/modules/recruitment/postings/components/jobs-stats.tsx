"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users, FileText, TrendingUp } from "lucide-react";

export function JobsStats() {
  const statsQuery = api.recruitment.getStats.useQuery();

  if (statsQuery.isLoading) {
    return <JobsStatsSkeleton />;
  }

  if (statsQuery.error) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">Failed to load statistics</p>
      </div>
    );
  }

  const stats = statsQuery.data;
  const jobsByStatus = stats?.jobsByStatus ?? [];
  const totalJobs = jobsByStatus.reduce((acc, item) => acc + item.count, 0);
  const openJobs =
    jobsByStatus.find((item) => item.status === "open")?.count ?? 0;
  const draftJobs =
    jobsByStatus.find((item) => item.status === "draft")?.count ?? 0;
  const closedJobs =
    jobsByStatus.find((item) => item.status === "closed")?.count ?? 0;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
          <Briefcase className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalJobs}</div>
          <p className="text-muted-foreground text-xs">All job postings</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
          <TrendingUp className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{openJobs}</div>
          <p className="text-muted-foreground text-xs">Currently hiring</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Draft Jobs</CardTitle>
          <FileText className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{draftJobs}</div>
          <p className="text-muted-foreground text-xs">Not yet published</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Applications
          </CardTitle>
          <Users className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats?.totalApplications ?? 0}
          </div>
          <p className="text-muted-foreground text-xs">
            All applications received
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function JobsStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="bg-muted h-4 w-20 animate-pulse rounded" />
            <div className="bg-muted h-4 w-4 animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="bg-muted mb-2 h-8 w-12 animate-pulse rounded" />
            <div className="bg-muted h-3 w-24 animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
