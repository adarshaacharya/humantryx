"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Mail,
  Phone,
  Calendar,
  FileText,
  ExternalLink,
  User,
  Upload,
  Brain,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { APPLICATION_STATUSES } from "../../consts";
import { UploadResumeDialog } from "./upload-resume-dialog";
import { ResumeScreeningDialog } from "../../resume-screening/resume-screening-dialog";
import { ApplicationsSkeleton } from "../../components/skeletons";

interface JobApplicationsProps {
  jobId: string;
}

export function JobApplications({ jobId }: JobApplicationsProps) {
  const applicationsQuery = api.recruitment.getApplications.useQuery({ jobId });

  if (applicationsQuery.isLoading) {
    return <ApplicationsSkeleton />;
  }

  if (applicationsQuery.error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
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

  const applications = applicationsQuery.data ?? [];

  const getStatusVariant = (status: string) => {
    const statusConfig = APPLICATION_STATUSES.find((s) => s.value === status);
    return statusConfig?.variant || "default";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Applications ({applications.length})</span>
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
            {applications.length > 0 && (
              <div className="flex gap-2">
                {APPLICATION_STATUSES.map((status) => {
                  const count = applications.filter(
                    (app) => app.status === status.value,
                  ).length;
                  if (count === 0) return null;
                  return (
                    <Badge
                      key={status.value}
                      variant={status.variant}
                      className="text-xs"
                    >
                      {status.label}: {count}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {applications.length === 0 ? (
          <div className="py-8 text-center">
            <User className="text-muted-foreground mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold">No applications yet</h3>
            <p className="text-muted-foreground">
              Applications will appear here once candidates start applying.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <div
                key={application.id}
                className="hover:bg-muted/50 rounded-lg border p-4 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-1 items-start gap-3">
                    {/* Avatar */}
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {application.candidateName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Application Details */}
                    <div className="flex-1 space-y-2">
                      {/* Name and Status */}
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">
                          {application.candidateName}
                        </h4>
                        <Badge variant={getStatusVariant(application.status)}>
                          {
                            APPLICATION_STATUSES.find(
                              (s) => s.value === application.status,
                            )?.label
                          }
                        </Badge>
                      </div>

                      {/* Contact Information */}
                      <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <a
                            href={`mailto:${application.candidateEmail}`}
                            className="hover:text-primary"
                          >
                            {application.candidateEmail}
                          </a>
                        </div>

                        {application.candidatePhone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <a
                              href={`tel:${application.candidatePhone}`}
                              className="hover:text-primary"
                            >
                              {application.candidatePhone}
                            </a>
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Applied{" "}
                            {formatDistanceToNow(
                              new Date(application.appliedAt),
                              { addSuffix: true },
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Cover Letter Preview */}
                      {application.coverLetter && (
                        <div className="text-sm">
                          <p className="text-muted-foreground line-clamp-2">
                            {application.coverLetter}
                          </p>
                        </div>
                      )}

                      {/* Review Information */}
                      {application.reviewedAt &&
                        application.reviewedByEmployee && (
                          <div className="text-muted-foreground text-xs">
                            Reviewed by {application.reviewedByEmployee.name} on{" "}
                            {format(new Date(application.reviewedAt), "PPP")}
                          </div>
                        )}

                      {/* Interview Date */}
                      {application.interviewDate && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">
                            Interview scheduled:{" "}
                          </span>
                          <span className="font-medium">
                            {format(
                              new Date(application.interviewDate),
                              "PPP 'at' p",
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-start gap-2">
                    {application.resumeUrl && (
                      <>
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={application.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FileText className="mr-1 h-4 w-4" />
                            Resume
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </Button>

                        <ResumeScreeningDialog
                          resumeUrl={application.resumeUrl}
                          candidateName={application.candidateName}
                          jobId={jobId}
                          applicationId={application.id}
                          trigger={
                            <Button variant="outline" size="sm">
                              <Brain className="mr-1 h-4 w-4" />
                              AI Screen
                            </Button>
                          }
                        />
                      </>
                    )}

                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
