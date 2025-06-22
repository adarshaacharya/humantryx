"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Users,
  DollarSign,
  Clock,
  Briefcase,
  Edit,
  Play,
  Square,
  ArrowLeft,
  Building2,
  GraduationCap,
  Share2,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  JOB_STATUSES,
  JOB_LOCATION_TYPES,
  getStatusVariant,
  getLocationIcon,
  formatSalaryRange,
} from "../../consts";
import { useState } from "react";
import { EditJobDialog } from "../upsert-job/edit-job-dialog";
import { JobDescriptionRenderer } from "../../components/job-description-renderer";
import { UploadResumeDialog } from "./upload-resume-dialog";
import { generateJobShareableUrl } from "@/lib/urls";
import { startCase } from "lodash-es";

interface JobDetailProps {
  jobId: string;
  organizationId?: string;
  isPublic?: boolean;
}

export function JobDetail({
  jobId,
  organizationId,
  isPublic = false,
}: JobDetailProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const router = useRouter();
  const utils = api.useUtils();

  // Use different query based on public mode
  const jobQuery =
    isPublic && organizationId
      ? api.recruitment.getByOrgAndJobId.useQuery({
          organizationId,
          jobId,
        })
      : api.recruitment.getById.useQuery({ id: jobId });

  const publishJobMutation = api.recruitment.publish.useMutation({
    onSuccess: () => {
      toast.success("Job published successfully!");
      void utils.recruitment.getById.invalidate({ id: jobId });
      void utils.recruitment.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to publish job");
    },
  });

  const closeJobMutation = api.recruitment.close.useMutation({
    onSuccess: () => {
      toast.success("Job closed successfully!");
      void utils.recruitment.getById.invalidate({ id: jobId });
      void utils.recruitment.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to close job");
    },
  });

  if (jobQuery.isLoading) {
    return <JobDetailSkeleton />;
  }

  if (jobQuery.error || !jobQuery.data) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <p className="text-muted-foreground">Job not found</p>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="mt-2"
            >
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const job = jobQuery.data;

  const handlePublishJob = () => {
    publishJobMutation.mutate({ id: jobId });
  };

  const handleCloseJob = () => {
    closeJobMutation.mutate({ id: jobId });
  };

  const handleShareJob = async () => {
    if (!job?.organizationId) {
      toast.error("Unable to generate shareable URL");
      return;
    }

    const shareableUrl = generateJobShareableUrl(job.organizationId, jobId);

    try {
      await navigator.clipboard.writeText(shareableUrl);
      toast.success("Job URL copied to clipboard!");
    } catch {
      toast.error("Failed to copy URL to clipboard");
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              {/* Back Button - Different behavior for public vs private */}
              {!isPublic ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="mb-2"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Jobs
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/")}
                  className="mb-2"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              )}

              {/* Job Title and Status */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">{job.title}</h1>
                  <Badge variant={getStatusVariant(job.status)}>
                    {JOB_STATUSES.find((s) => s.value === job.status)?.label}
                  </Badge>
                </div>

                {/* Quick Info */}
                <div className="text-muted-foreground flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    <span>{startCase(job.department)}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span>{getLocationIcon(job.locationType)}</span>
                    <span>
                      {
                        JOB_LOCATION_TYPES.find(
                          (l) => l.value === job.locationType,
                        )?.label
                      }
                      {job.location && ` • ${job.location}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Posted{" "}
                      {formatDistanceToNow(new Date(job.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  {job.createdByEmployee && (
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>by {job.createdByEmployee.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {!isPublic && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>

                {job.status === "draft" && (
                  <Button
                    onClick={handlePublishJob}
                    disabled={publishJobMutation.isPending}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    {publishJobMutation.isPending ? "Publishing..." : "Publish"}
                  </Button>
                )}

                {job.status === "open" && (
                  <Button
                    variant="outline"
                    onClick={handleCloseJob}
                    disabled={closeJobMutation.isPending}
                  >
                    <Square className="mr-2 h-4 w-4" />
                    {closeJobMutation.isPending ? "Closing..." : "Close"}
                  </Button>
                )}

                {/* Share Button - Only show for open jobs */}
                {job.status === "open" && (
                  <Button variant="outline" onClick={handleShareJob}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Job
                  </Button>
                )}
              </div>
            )}

            {/* Apply Button for Public Users */}
            {isPublic && job.status === "open" && (
              <div className="flex items-center gap-2">
                <UploadResumeDialog
                  jobId={jobId}
                  trigger={
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Apply Now
                    </Button>
                  }
                />
              </div>
            )}

            {/* Status message for non-open jobs in public mode */}
            {isPublic && job.status !== "open" && (
              <div className="flex items-center gap-2">
                <div className="bg-muted rounded-lg p-4 text-center">
                  <p className="text-muted-foreground">
                    {job.status === "draft"
                      ? "This position is not yet open for applications."
                      : "This position is no longer accepting applications."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            {formatSalaryRange(
              job.salaryRangeMin,
              job.salaryRangeMax,
              job.salaryCurrency,
            ) && (
              <div className="space-y-2">
                <h3 className="flex items-center gap-2 font-semibold">
                  <DollarSign className="h-4 w-4" />
                  Salary Range
                </h3>
                <p className="text-lg font-medium text-green-600">
                  {formatSalaryRange(
                    job.salaryRangeMin,
                    job.salaryRangeMax,
                    job.salaryCurrency,
                  )}
                </p>
              </div>
            )}

            {/* Experience Required */}
            {job.experienceRequired && (
              <div className="space-y-2">
                <h3 className="flex items-center gap-2 font-semibold">
                  <GraduationCap className="h-4 w-4" />
                  Experience Required
                </h3>
                <p>{job.experienceRequired}</p>
              </div>
            )}

            {/* Job Type */}
            <div className="space-y-2">
              <h3 className="flex items-center gap-2 font-semibold">
                <Briefcase className="h-4 w-4" />
                Work Type
              </h3>
              <div className="flex items-center gap-2">
                <span>{getLocationIcon(job.locationType)}</span>
                <span>
                  {
                    JOB_LOCATION_TYPES.find((l) => l.value === job.locationType)
                      ?.label
                  }
                </span>
                {job.location && (
                  <>
                    <span>•</span>
                    <span>{job.location}</span>
                  </>
                )}
              </div>
            </div>

            {/* Posted Date */}
            <div className="space-y-2">
              <h3 className="flex items-center gap-2 font-semibold">
                <Clock className="h-4 w-4" />
                Timeline
              </h3>
              <div className="space-y-1 text-sm">
                <p>Created: {format(new Date(job.createdAt), "PPP")}</p>
                {job.publishedAt && (
                  <p>Published: {format(new Date(job.publishedAt), "PPP")}</p>
                )}
                {job.closedAt && (
                  <p>Closed: {format(new Date(job.closedAt), "PPP")}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Job Description */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Job Description</h2>
            <JobDescriptionRenderer content={job.description} />
          </div>

          {/* Required Skills */}
          {job.skills && job.skills.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Additional Requirements */}
          {job.requirements && (
            <>
              <Separator />
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">
                  Additional Requirements
                </h2>
                <div className="prose prose-sm max-w-none">
                  <p className="leading-relaxed whitespace-pre-wrap">
                    {job.requirements}
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {!isPublic && (
        <EditJobDialog
          job={job}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </>
  );
}

function JobDetailSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="space-y-4">
          <div className="bg-muted h-6 w-20 animate-pulse rounded" />
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="bg-muted h-8 w-64 animate-pulse rounded" />
              <div className="bg-muted h-6 w-16 animate-pulse rounded" />
            </div>
            <div className="flex gap-4">
              <div className="bg-muted h-4 w-24 animate-pulse rounded" />
              <div className="bg-muted h-4 w-32 animate-pulse rounded" />
              <div className="bg-muted h-4 w-28 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="bg-muted h-5 w-32 animate-pulse rounded" />
              <div className="bg-muted h-4 w-24 animate-pulse rounded" />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="bg-muted h-6 w-40 animate-pulse rounded" />
          <div className="space-y-2">
            <div className="bg-muted h-4 w-full animate-pulse rounded" />
            <div className="bg-muted h-4 w-full animate-pulse rounded" />
            <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
