"use client";

import { useState, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JobDetail } from "@/modules/recruitment/postings/listing/job-detail";
import { JobApplicationsTabbed } from "./job-applications-tabbed";
import { Users, FileText } from "lucide-react";
import { api } from "@/trpc/react";
import {
  ApplicationsSkeleton,
  JobDetailSkeleton,
} from "../../components/skeletons";

interface JobDetailWithTabsProps {
  jobId: string;
  organizationId?: string;
  isPublic?: boolean;
}

export function JobDetailWithTabs({
  jobId,
  organizationId,
  isPublic = false,
}: JobDetailWithTabsProps) {
  const [activeTab, setActiveTab] = useState<"details" | "applications">(
    "details",
  );

  // Only fetch applications if not in public mode
  const applicationsQuery = api.recruitment.getApplications.useQuery(
    { jobId },
    { enabled: !isPublic },
  );
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
            {!isPublic ? (
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger
                  value="details"
                  className="flex items-center gap-2"
                >
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
            ) : (
              <div className="flex items-center gap-2 text-lg font-semibold">
                <FileText className="h-5 w-5" />
                Job Details
              </div>
            )}
          </CardHeader>
        </Card>

        <TabsContent value="details" className="mt-0">
          <Suspense fallback={<JobDetailSkeleton />}>
            <JobDetail
              jobId={jobId}
              organizationId={organizationId}
              isPublic={isPublic}
            />
          </Suspense>
        </TabsContent>

        {!isPublic && (
          <TabsContent value="applications" className="mt-0">
            <Suspense fallback={<ApplicationsSkeleton />}>
              <JobApplicationsTabbed jobId={jobId} />
            </Suspense>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
