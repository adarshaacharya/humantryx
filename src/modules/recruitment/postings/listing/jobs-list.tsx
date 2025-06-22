"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Edit,
  Trash2,
  Calendar,
  Users,
  DollarSign,
  MoreHorizontal,
  Play,
  Square,
  Briefcase,
  Share2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { authClient } from "@/server/auth/auth-client";
import { JOB_STATUSES, JOB_LOCATION_TYPES } from "../../consts";
import type { JobStatus } from "../../consts";
import { generateJobShareableUrl } from "@/lib/urls";
import { startCase } from "lodash-es";
import { JobDescriptionRenderer } from "../../components/job-description-renderer";

interface Job {
  id: string;
  title: string;
  department: string;
  description: string;
  locationType: string;
  location: string | null;
  status: JobStatus;
  salaryRangeMin: number | null;
  salaryRangeMax: number | null;
  salaryCurrency: string | null;
  experienceRequired: string | null;
  skills: string[] | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  createdByEmployee: {
    id: string | null;
    name: string | null;
  } | null;
  applicationCount: number;
}

export function JobsList() {
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);

  const router = useRouter();
  const utils = api.useUtils();
  const { data: session } = authClient.useSession();

  const jobsQuery = api.recruitment.list.useQuery({
    limit: 20,
  });

  const publishJobMutation = api.recruitment.publish.useMutation({
    onSuccess: () => {
      toast.success("Job published successfully!");
      void utils.recruitment.list.invalidate();
      void utils.recruitment.getStats.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to publish job");
    },
  });

  const closeJobMutation = api.recruitment.close.useMutation({
    onSuccess: () => {
      toast.success("Job closed successfully!");
      void utils.recruitment.list.invalidate();
      void utils.recruitment.getStats.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to close job");
    },
  });

  const handlePublishJob = (jobId: string) => {
    publishJobMutation.mutate({ id: jobId });
  };

  const handleCloseJob = (jobId: string) => {
    closeJobMutation.mutate({ id: jobId });
  };

  const handleViewJob = (jobId: string) => {
    router.push(`/dashboard/recruitment/jobs/${jobId}`);
  };

  const handleShareJob = async (jobId: string) => {
    if (!session?.session?.activeOrganizationId) {
      toast.error("Organization not found");
      return;
    }

    const shareableUrl = generateJobShareableUrl(
      session.session.activeOrganizationId,
      jobId,
    );

    try {
      await navigator.clipboard.writeText(shareableUrl);
      toast.success("Job URL copied to clipboard!");
    } catch {
      toast.error("Failed to copy URL to clipboard");
    }
  };

  const getStatusVariant = (status: string) => {
    const statusConfig = JOB_STATUSES.find((s) => s.value === status);
    return statusConfig?.variant || "default";
  };

  const getLocationIcon = (locationType: string) => {
    const locationConfig = JOB_LOCATION_TYPES.find(
      (l) => l.value === locationType,
    );
    return locationConfig?.icon || "🏢";
  };

  const formatSalaryRange = (
    min?: number | null,
    max?: number | null,
    currency = "USD",
  ) => {
    if (!min && !max) return null;

    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
    });

    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)}`;
    }

    if (min) {
      return `From ${formatter.format(min)}`;
    }

    if (max) {
      return `Up to ${formatter.format(max)}`;
    }
  };

  if (jobsQuery.isLoading) {
    return <JobsListSkeleton />;
  }

  if (jobsQuery.error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <p className="text-muted-foreground">Failed to load jobs</p>
            <Button
              variant="outline"
              onClick={() => jobsQuery.refetch()}
              className="mt-2"
            >
              Try again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const jobs = jobsQuery.data?.jobs ?? [];

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <Briefcase className="text-muted-foreground mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold">No jobs found</h3>
            <p className="text-muted-foreground">
              Get started by creating your first job posting
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="border-b pb-6 last:border-b-0 last:pb-0"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Job Title and Status */}
                    <div className="flex items-center gap-3">
                      <h3 className="hover:text-primary cursor-pointer text-lg font-semibold">
                        {job.title}
                      </h3>
                      <Badge variant={getStatusVariant(job.status)}>
                        {
                          JOB_STATUSES.find((s) => s.value === job.status)
                            ?.label
                        }
                      </Badge>
                    </div>

                    {/* Job Details */}
                    <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">
                          {startCase(job.department)}
                        </span>
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
                        <Calendar className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(new Date(job.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{job.applicationCount} applications</span>
                      </div>
                    </div>

                    {/* Job Description */}
                    <div className="text-muted-foreground line-clamp-2 text-sm">
                      <JobDescriptionRenderer content={job.description} />
                    </div>

                    {/* Job Details Row */}
                    <div className="flex flex-wrap items-center gap-4">
                      {/* Salary Range */}
                      {formatSalaryRange(
                        job.salaryRangeMin,
                        job.salaryRangeMax,
                        job.salaryCurrency || "USD",
                      ) && (
                        <div className="flex items-center gap-1 text-sm">
                          <DollarSign className="h-3 w-3" />
                          <span>
                            {formatSalaryRange(
                              job.salaryRangeMin,
                              job.salaryRangeMax,
                              job.salaryCurrency || "USD",
                            )}
                          </span>
                        </div>
                      )}

                      {/* Experience */}
                      {job.experienceRequired && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">
                            Experience:{" "}
                          </span>
                          <span>{job.experienceRequired}</span>
                        </div>
                      )}

                      {/* Skills */}
                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {job.skills.slice(0, 3).map((skill, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {job.skills.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{job.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-start gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewJob(job.id)}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            if (!job) return;
                            setEditingJob(job);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>

                        {job.status === "draft" && (
                          <DropdownMenuItem
                            onClick={() => handlePublishJob(job.id)}
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Publish
                          </DropdownMenuItem>
                        )}

                        {job.status === "open" && (
                          <DropdownMenuItem
                            onClick={() => handleCloseJob(job.id)}
                          >
                            <Square className="mr-2 h-4 w-4" />
                            Close
                          </DropdownMenuItem>
                        )}

                        {job.status === "open" && (
                          <DropdownMenuItem
                            onClick={() => handleShareJob(job.id)}
                          >
                            <Share2 className="mr-2 h-4 w-4" />
                            Share Job
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeletingJobId(job.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleShareJob(job.id)}
                        >
                          <Share2 className="mr-2 h-4 w-4" />
                          Share
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Placeholder for future dialogs */}
      {editingJob && <div>Edit dialog will go here</div>}

      {deletingJobId && <div>Delete dialog will go here</div>}
    </>
  );
}

function JobsListSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border-b pb-6 last:border-b-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-muted h-6 w-48 animate-pulse rounded" />
                    <div className="bg-muted h-5 w-16 animate-pulse rounded" />
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-muted h-4 w-24 animate-pulse rounded" />
                    <div className="bg-muted h-4 w-32 animate-pulse rounded" />
                    <div className="bg-muted h-4 w-28 animate-pulse rounded" />
                  </div>
                  <div className="space-y-2">
                    <div className="bg-muted h-4 w-full animate-pulse rounded" />
                    <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
                  </div>
                  <div className="flex gap-2">
                    <div className="bg-muted h-6 w-16 animate-pulse rounded" />
                    <div className="bg-muted h-6 w-20 animate-pulse rounded" />
                    <div className="bg-muted h-6 w-24 animate-pulse rounded" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="bg-muted h-8 w-16 animate-pulse rounded" />
                  <div className="bg-muted h-8 w-8 animate-pulse rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
