"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Upload, Brain, Sparkles } from "lucide-react";
import { UploadResumeDialog } from "./upload-resume-dialog";
import { ApplicationCard } from "./application-card";
import { TabContentSkeleton } from "../../components/skeletons";
import { toast } from "sonner";
import type { ApplicationStatus } from "../../types";

interface JobApplicationsProps {
  jobId: string;
}

export function JobApplicationsTabbed({ jobId }: JobApplicationsProps) {
  const [activeTab, setActiveTab] = useState<ApplicationStatus>("all");
  const [bulkScreening, setBulkScreening] = useState(false);

  const applicationsQuery = api.recruitment.getApplications.useQuery({
    jobId,
    status: activeTab,
  });

  const countsQuery = api.recruitment.getApplicationCounts.useQuery({ jobId });

  const aiScreenMutation = api.ai.screenResume.useMutation();

  const applications = applicationsQuery.data ?? [];
  const tabCounts = countsQuery.data ?? { all: 0, pending: 0, screened: 0 };

  // Bulk screening handler
  const handleBulkScreening = async () => {
    const unscreenedApps = applications.filter(
      (app) => app.resumeUrl && !app.aiScreeningResult,
    );

    if (unscreenedApps.length === 0) {
      toast.info("No applications with resumes to screen");
      return;
    }

    setBulkScreening(true);
    let screened = 0;

    try {
      for (const app of unscreenedApps) {
        if (app.resumeUrl) {
          await aiScreenMutation.mutateAsync({
            resumeUrl: app.resumeUrl,
            jobId: jobId,
          });
          screened++;
          toast.success(
            `Screened ${screened}/${unscreenedApps.length} resumes`,
          );
        }
      }

      await applicationsQuery.refetch();
      await countsQuery.refetch();
      toast.success(`Bulk screening completed! Screened ${screened} resumes.`);
    } catch (error) {
      console.error("Bulk screening error:", error);
      toast.error("Bulk screening failed. Please try again.");
    } finally {
      setBulkScreening(false);
    }
  };

  if (applicationsQuery.error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Applications</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Failed to load applications</p>
            <Button
              variant="outline"
              onClick={() => applicationsQuery.refetch()}
              className="mt-2"
            >
              Try again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold">Job Applications</h2>
            <Badge variant="secondary">{tabCounts.all}</Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Manage and screen candidate applications with AI-powered insights
          </p>
        </div>

        <div className="flex items-center gap-3">
          <UploadResumeDialog
            jobId={jobId}
            trigger={
              <Button size="sm">
                <Upload className="mr-2 h-4 w-4" />
                Upload Resume
              </Button>
            }
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleBulkScreening}
            disabled={bulkScreening || tabCounts.pending === 0}
          >
            {bulkScreening ? (
              <>
                <Brain className="mr-2 h-4 w-4 animate-pulse" />
                Screening...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Screen All ({tabCounts.pending})
              </>
            )}
          </Button>
        </div>
      </div>

      <Card>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as ApplicationStatus)}
        >
          <CardHeader className="pb-3">
            <TabsList className="grid w-full max-w-lg grid-cols-3">
              <TabsTrigger value="all" className="flex items-center gap-2">
                All ({tabCounts.all})
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-2">
                Pending Screening ({tabCounts.pending})
              </TabsTrigger>
              <TabsTrigger value="screened" className="flex items-center gap-2">
                AI Screened ({tabCounts.screened})
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent>
            <TabsContent value={activeTab} className="mt-0">
              {applicationsQuery.isLoading ? (
                <TabContentSkeleton />
              ) : applications.length === 0 ? (
                <div className="py-12 text-center">
                  <User className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                  <h3 className="mb-2 text-lg font-semibold">
                    {activeTab === "pending" && "No pending applications"}
                    {activeTab === "screened" && "No reviewed applications"}
                    {activeTab === "all" && "No applications yet"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {activeTab === "all"
                      ? "Applications will appear here once candidates start applying."
                      : `Switch to other tabs to see applications or upload new resumes.`}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                      jobId={jobId}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
