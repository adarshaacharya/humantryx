import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Calendar, FileText, Brain, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { APPLICATION_STATUSES } from "../../consts";
import type { JobApplicationType } from "../../types";
import { ResumeScreeningDialog } from "../../resume-screening/resume-screening-dialog";
import { AIResultsViewer } from "../../resume-screening/ai-results-viewer";
import { startCase } from "lodash-es";

interface ApplicationCardProps {
  application: JobApplicationType;
  jobId: string;
}

export function ApplicationCard({ application, jobId }: ApplicationCardProps) {
  const getStatusVariant = (status: string) => {
    const statusConfig = APPLICATION_STATUSES.find((s) => s.value === status);
    return statusConfig?.variant || "default";
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-1 items-start gap-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10">
                {application.candidateName
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-3">
              {/* Header with Name and Status */}
              <div className="flex flex-wrap items-center gap-3">
                <h4 className="text-lg font-semibold">
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

                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Applied{" "}
                    {formatDistanceToNow(new Date(application.appliedAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>

              {application.coverLetter && (
                <div className="text-sm">
                  <p className="text-muted-foreground line-clamp-2">
                    {application.coverLetter}
                  </p>
                </div>
              )}

              {application.aiScreeningResult?.recommendation && (
                <div className="flex items-center gap-2 text-sm">
                  <Badge
                    variant={
                      application.aiScreeningResult.recommendation ===
                      "shortlist"
                        ? "default"
                        : application.aiScreeningResult.recommendation ===
                            "reject"
                          ? "destructive"
                          : "secondary"
                    }
                    className="text-xs"
                  >
                    AI Evaluation:{" "}
                    {startCase(application.aiScreeningResult.recommendation)}
                  </Badge>
                  <span className="text-muted-foreground">
                    Score: {application.aiScreeningResult.matchScore}%
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
                  </a>
                </Button>

                <ResumeScreeningDialog
                  resumeUrl={application.resumeUrl}
                  candidateName={application.candidateName}
                  jobId={jobId}
                  applicationId={application.id}
                  trigger={
                    <Button variant="outline" size="sm">
                      <Sparkles className="mr-1 h-4 w-4" />
                      AI Screen
                    </Button>
                  }
                />
              </>
            )}

            {/* View AI Results Button - Only show if AI screening results exist */}
            {application.aiScreeningResult?.recommendation && (
              <AIResultsViewer
                application={application}
                trigger={
                  <Button
                    variant="secondary"
                    size="sm"
                    className="hover:bg-primary/10 gap-1 transition-all"
                  >
                    <Brain className="text-primary h-4 w-4" />
                    View AI Results
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
