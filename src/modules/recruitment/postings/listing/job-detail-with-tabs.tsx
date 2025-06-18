"use client";

import { useState, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { JobDetail } from "@/modules/recruitment/postings/listing/job-detail";
import { JobApplicationsTabbed } from "./job-applications-tabbed";
import { Users, FileText } from "lucide-react";
import { api } from "@/trpc/react";
import { ApplicationsSkeleton } from "../../components/skeletons";

interface JobDetailWithTabsProps {
  jobId: string;
}

export function JobDetailWithTabs({ jobId }: JobDetailWithTabsProps) {
  const [activeTab, setActiveTab] = useState<"details" | "applications">(
    "details",
  );

  const applicationsQuery = api.recruitment.getApplications.useQuery({ jobId });
  const applicationCount = applicationsQuery.data?.length ?? 0;

  return (
    <div className="space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as "details" | "applications")
        }
      >
        <Card>
          <CardHeader className="pb-3">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="details" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Job Details
              </TabsTrigger>
              <TabsTrigger
                value="applications"
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Applications
                {applicationCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {applicationCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </CardHeader>
        </Card>

        {/* Tab Content */}
        <TabsContent value="details" className="mt-0">
          <Suspense fallback={<JobDetailSkeleton />}>
            <JobDetail jobId={jobId} />
          </Suspense>
        </TabsContent>

        <TabsContent value="applications" className="mt-0">
          <Suspense fallback={<ApplicationsSkeleton />}>
            <JobApplicationsTabbed jobId={jobId} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function JobDetailSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-24" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-20" />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
