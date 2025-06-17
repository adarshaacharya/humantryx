"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Brain, FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { getRecommendationVariant } from "../consts";

interface ResumeScreeningDialogProps {
  resumeUrl?: string;
  candidateName: string;
  jobId: string;
  trigger?: React.ReactNode;
}

export function ResumeScreeningDialog({
  resumeUrl,
  candidateName,
  jobId: _jobId,
  trigger,
}: ResumeScreeningDialogProps) {
  const [open, setOpen] = useState(false);
  const [isScreening, setIsScreening] = useState(false);
  const [screeningResults, setScreeningResults] = useState<{
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
    experience: string;
    summary: string;
    recommendation: "hire" | "interview" | "reject";
  } | null>(null);

  const resumeScreenMutation = api.ai.screenResume.useMutation();

  const handleScreenResume = async () => {
    if (!resumeUrl) {
      toast.error("No resume available for screening");
      return;
    }

    setIsScreening(true);
    resumeScreenMutation.mutate(
      { resumeUrl, jobId: _jobId },
      {
        onSuccess: (data) => {
          toast.success("Resume screening completed successfully!");
        },
        onError: (error) => {
          console.error("Resume screening error:", error);
          toast.error("Failed to screen resume. Please try again.");
        },
        onSettled: (data, error) => {
          setIsScreening(false);
        },
      },
    );
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case "hire":
        return <CheckCircle className="h-4 w-4" />;
      case "interview":
        return <Clock className="h-4 w-4" />;
      case "reject":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" disabled={!resumeUrl}>
            <Brain className="mr-2 h-4 w-4" />
            AI Screen Resume
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Resume Screening - {candidateName}
          </DialogTitle>
          <DialogDescription>
            Analyze the candidate&apos;s resume using AI to get insights about
            their qualifications and fit for the position.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resume Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Resume Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {candidateName}&apos;s Resume
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {resumeUrl ? "Resume available" : "No resume uploaded"}
                  </p>
                </div>
                <div className="flex gap-2">
                  {resumeUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Resume
                      </a>
                    </Button>
                  )}
                  <Button
                    onClick={handleScreenResume}
                    disabled={!resumeUrl || isScreening}
                    size="sm"
                  >
                    {isScreening ? (
                      <>
                        <Brain className="mr-2 h-4 w-4 animate-pulse" />
                        Screening...
                      </>
                    ) : (
                      <>
                        <Brain className="mr-2 h-4 w-4" />
                        Start AI Screening
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Screening Results */}
          {screeningResults && (
            <div className="space-y-4">
              {/* Overall Score and Recommendation */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Screening Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">
                          {screeningResults.score}%
                        </span>
                        <span className="text-muted-foreground">
                          Match Score
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {screeningResults.experience}
                      </p>
                    </div>
                    <Badge
                      variant={getRecommendationVariant(
                        screeningResults.recommendation,
                      )}
                      className="flex items-center gap-1 px-3 py-1 text-sm"
                    >
                      {getRecommendationIcon(screeningResults.recommendation)}
                      {screeningResults.recommendation.toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Skills Analysis */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-green-600">
                      Matched Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {screeningResults.matchedSkills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="default"
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-orange-600">
                      Missing Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {screeningResults.missingSkills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="outline"
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    AI Analysis Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">
                    {screeningResults.summary}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Placeholder for future implementation */}
          {!screeningResults && !isScreening && (
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <div className="py-8 text-center">
                  <Brain className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                  <h3 className="mb-2 text-lg font-semibold">
                    AI Resume Screening
                  </h3>
                  <p className="text-muted-foreground mx-auto mb-4 max-w-md">
                    Click &quot;Start AI Screening&quot; to analyze this
                    candidate&apos;s resume and get AI-powered insights about
                    their qualifications.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    <strong>Note:</strong> This feature uses advanced AI to
                    analyze resumes against job requirements and provide scoring
                    recommendations.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
            {screeningResults && <Button>Save Screening Results</Button>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
