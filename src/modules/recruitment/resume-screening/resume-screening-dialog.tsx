"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
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
import {
  Brain,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Target,
  Award,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import type { AIRecommendation } from "@/server/api/services/recruitment.service";

interface ScreeningResult {
  score: number;
  recommendation: AIRecommendation;
  matchedSkills: string[];
  missingSkills: string[];
  summary: string;
  confidence: number;
  processed_at?: string;
}

interface ResumeScreeningDialogProps {
  resumeUrl?: string;
  candidateName: string;
  jobId: string;
  applicationId: string;
  existingResults?: ScreeningResult;
  trigger?: React.ReactNode;
}

export function ResumeScreeningDialog({
  resumeUrl,
  candidateName,
  jobId,
  applicationId,
  existingResults,
  trigger,
}: ResumeScreeningDialogProps) {
  const [open, setOpen] = useState(false);
  const [isScreening, setIsScreening] = useState(false);
  const [screeningResults, setScreeningResults] =
    useState<ScreeningResult | null>(existingResults || null);

  const utils = api.useUtils();
  const aiScreenMutation = api.ai.screenResume.useMutation();
  const saveScreeningResultMutation =
    api.recruitment.createScreeningResult.useMutation();

  const handleScreenResume = async () => {
    if (!resumeUrl) {
      toast.error("No resume available for screening");
      return;
    }

    setIsScreening(true);
    try {
      const result = await aiScreenMutation.mutateAsync({
        resumeUrl,
        jobId,
      });

      // Transform the AI service response to match our UI expectations
      const transformedResult: ScreeningResult = {
        score: result.matchScore || 0,
        recommendation: result.recommendation || "reject",
        matchedSkills: result.matchedSkills || [],
        missingSkills: result.missingSkills || [],
        summary: result.reasoning || "No analysis summary available.",
        confidence: result.confidence || 0,
        processed_at: new Date().toISOString(),
      };

      setScreeningResults(transformedResult);

      await utils.recruitment.getApplications.invalidate({ jobId });

      toast.success("Resume screening completed successfully!");
    } catch (error) {
      console.error("Resume screening error:", error);
      toast.error("Failed to screen resume. Please try again.");
    } finally {
      setIsScreening(false);
    }
  };

  const handleSaveResults = async () => {
    if (!screeningResults) {
      toast.error("No screening results to save");
      return;
    }

    try {
      await saveScreeningResultMutation.mutateAsync({
        jobApplicationId: applicationId,
        matchScore: screeningResults.score,
        confidence: screeningResults.confidence,
        recommendation: screeningResults.recommendation,
        matchedSkills: screeningResults.matchedSkills,
        missingSkills: screeningResults.missingSkills,
        summary: screeningResults.summary,
        aiModel: "groq-llama",
        processingTime: Date.now() - Date.now(), // This would be calculated properly in real implementation
      });

      // Refresh applications data
      await utils.recruitment.getApplications.invalidate({ jobId });

      toast.success("Analysis results saved successfully!");
      setOpen(false);
    } catch (error) {
      console.error("Error saving screening results:", error);
      toast.error("Failed to save analysis results. Please try again.");
    }
  };

  const getRecommendationVariant = (recommendation: AIRecommendation) => {
    switch (recommendation) {
      case "shortlist":
        return "default";

      case "reject":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getRecommendationIcon = (recommendation: AIRecommendation) => {
    switch (recommendation) {
      case "shortlist":
        return <CheckCircle className="h-4 w-4" />;
      case "reject":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return "from-green-500 to-green-600";
    if (score >= 60) return "from-yellow-500 to-yellow-600";
    return "from-red-500 to-red-600";
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
      <DialogContent className="max-h-[90vh] min-w-6xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-500" />
            AI Resume Analysis - {candidateName}
          </DialogTitle>
          <DialogDescription>
            Comprehensive AI-powered analysis of the candidate&apos;s resume
            against job requirements.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resume Info & Action Panel */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-blue-100 p-3">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {candidateName}&apos;s Resume
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {resumeUrl
                        ? "Resume available for analysis"
                        : "No resume uploaded"}
                    </p>
                    {screeningResults?.processed_at && (
                      <p className="text-muted-foreground text-xs">
                        Last analyzed{" "}
                        {formatDistanceToNow(
                          new Date(screeningResults.processed_at),
                          { addSuffix: true },
                        )}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {resumeUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        View Resume
                        <ExternalLink className="ml-1 h-3 w-3" />
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
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        {screeningResults
                          ? "Re-analyze Resume"
                          : "Start AI Analysis"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loading State - maintains modal height */}
          {isScreening && (
            <div className="space-y-6">
              {/* Loading Overall Score */}
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600">
                            <Brain className="h-8 w-8 animate-spin text-white" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">
                            Analyzing Resume...
                          </h3>
                          <p className="text-muted-foreground">
                            AI processing in progress
                          </p>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div className="h-2 w-1/2 animate-pulse rounded-full bg-gradient-to-r from-blue-400 to-blue-600" />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="mb-2 h-10 w-24 animate-pulse rounded bg-gray-200" />
                      <p className="text-muted-foreground text-sm">
                        Processing...
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Loading Skills Analysis */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="border-gray-200 bg-gray-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-gray-600">
                      <div className="h-5 w-5 animate-pulse rounded bg-gray-300" />
                      Analyzing Skills...
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-6 w-16 animate-pulse rounded bg-gray-200"
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 bg-gray-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-gray-600">
                      <div className="h-5 w-5 animate-pulse rounded bg-gray-300" />
                      Identifying Gaps...
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-6 w-20 animate-pulse rounded bg-gray-200"
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Loading AI Analysis Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 animate-pulse text-blue-500" />
                    Generating Analysis...
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 space-y-2 rounded-lg p-4">
                    <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                    <div className="h-4 w-4/5 animate-pulse rounded bg-gray-200" />
                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                  </div>
                </CardContent>
              </Card>

              {/* Loading Recommendations */}
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Award className="h-5 w-5 animate-pulse" />
                    Preparing Recommendations...
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="rounded-lg border border-gray-200 bg-gray-100 p-3">
                      <div className="space-y-2">
                        <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Screening Results */}
          {screeningResults && !isScreening && (
            <div className="space-y-6">
              {/* Overall Score and Recommendation */}
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div
                            className={`h-16 w-16 rounded-full bg-gradient-to-br ${getScoreGradient(screeningResults.score)} flex items-center justify-center`}
                          >
                            <span className="text-2xl font-bold text-white">
                              {screeningResults.score}
                            </span>
                          </div>
                          <div className="absolute -right-1 -bottom-1 rounded-full bg-white p-1">
                            <Target className="h-3 w-3 text-blue-500" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">
                            Overall Match Score
                          </h3>
                          <p className="text-muted-foreground">
                            {screeningResults.confidence}% confidence level
                          </p>
                        </div>
                      </div>

                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${getScoreGradient(screeningResults.score)} transition-all duration-500`}
                          style={{ width: `${screeningResults.score}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-right">
                      <Badge
                        variant={getRecommendationVariant(
                          screeningResults.recommendation,
                        )}
                        className="mb-2 flex items-center gap-2 px-4 py-2 text-lg"
                      >
                        {getRecommendationIcon(screeningResults.recommendation)}
                        {screeningResults.recommendation.toUpperCase()}
                      </Badge>
                      <p className="text-muted-foreground text-sm">
                        AI Recommendation
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Skills Analysis */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Matched Skills */}
                <Card className="border-green-200 bg-green-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-5 w-5" />
                      Matched Skills ({screeningResults.matchedSkills.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {screeningResults.matchedSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {screeningResults.matchedSkills.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="default"
                            className="border-green-200 bg-green-100 text-green-800"
                          >
                            <CheckCircle className="mr-1 h-3 w-3" />
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No matching skills identified
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Missing Skills */}
                <Card className="border-orange-200 bg-orange-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-orange-700">
                      <AlertCircle className="h-5 w-5" />
                      Missing Skills ({screeningResults.missingSkills.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {screeningResults.missingSkills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {screeningResults.missingSkills.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="border-orange-200 bg-orange-100 text-orange-800"
                          >
                            <AlertCircle className="mr-1 h-3 w-3" />
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        All required skills present
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* AI Analysis Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-500" />
                    Detailed AI Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm leading-relaxed">
                      {screeningResults.summary}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendation Insights */}
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Award className="h-5 w-5" />
                    Next Steps & Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {screeningResults.recommendation === "shortlist" && (
                      <div className="rounded-lg border border-green-200 bg-green-100 p-3">
                        <p className="text-sm font-medium text-green-800">
                          ✅ <strong>Strong Candidate:</strong> This candidate
                          demonstrates excellent alignment with the job
                          requirements. Consider proceeding with an offer or
                          final interview.
                        </p>
                      </div>
                    )}

                    {screeningResults.recommendation === "reject" && (
                      <div className="rounded-lg border border-red-200 bg-red-100 p-3">
                        <p className="text-sm font-medium text-red-800">
                          ❌ <strong>Not a Match:</strong> This candidate
                          doesn&apos;t meet the minimum requirements for this
                          position. Consider for other roles or future
                          opportunities.
                        </p>
                      </div>
                    )}

                    {screeningResults.missingSkills.length > 0 && (
                      <div className="rounded-lg border border-yellow-200 bg-yellow-100 p-3">
                        <p className="text-sm font-medium text-yellow-800">
                          💡 <strong>Training Opportunity:</strong> If hired,
                          consider providing training in:{" "}
                          {screeningResults.missingSkills
                            .slice(0, 3)
                            .join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Placeholder for unscreened resumes - matches full height */}
          {!screeningResults && !isScreening && (
            <div className="space-y-6">
              {/* Main placeholder card matching overall score height */}
              <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                            <Brain className="h-8 w-8 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">
                            AI Resume Analysis
                          </h3>
                          <p className="text-muted-foreground">
                            Ready to analyze candidate qualifications
                          </p>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100">
                        <div className="h-2 w-0 rounded-full bg-blue-500 transition-all duration-300" />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="mb-2 flex items-center justify-center rounded-lg border-2 border-dashed border-blue-300 px-4 py-2">
                        <span className="text-sm font-medium text-blue-600">
                          Ready to Start
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Click &quot;Start AI Analysis&quot;
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Placeholder skills analysis cards */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="border-2 border-dashed border-gray-200 bg-gray-50/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-gray-500">
                      <TrendingUp className="h-5 w-5" />
                      Skills Matching
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <div className="rounded border-2 border-dashed border-gray-300 px-3 py-1">
                        <span className="text-xs text-gray-500">
                          Skill analysis pending
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-dashed border-gray-200 bg-gray-50/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-gray-500">
                      <Target className="h-5 w-5" />
                      Gap Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <div className="rounded border-2 border-dashed border-gray-300 px-3 py-1">
                        <span className="text-xs text-gray-500">
                          Gap identification pending
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Placeholder AI analysis summary */}
              <Card className="border-2 border-dashed border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-gray-500">
                    <Brain className="h-5 w-5" />
                    AI Analysis Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-center text-sm text-gray-500">
                      Comprehensive AI-powered analysis will appear here after
                      processing. Click &quot;Start AI Analysis&quot; to get detailed
                      insights about this candidate&apos;s qualifications, skill
                      matches, and hiring recommendations.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Placeholder recommendations */}
              <Card className="border-2 border-dashed border-blue-200 bg-blue-50/30">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-blue-600">
                    <Award className="h-5 w-5" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="rounded-lg border-2 border-dashed border-blue-300 bg-blue-100/50 p-3">
                      <div className="text-center">
                        <div className="mx-auto grid max-w-lg grid-cols-1 gap-4 text-sm md:grid-cols-3">
                          <div className="flex items-center justify-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span>Skill Matching</span>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <Target className="h-4 w-4 text-blue-500" />
                            <span>Score Analysis</span>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <Award className="h-4 w-4 text-purple-500" />
                            <span>Recommendations</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Separator />

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
            {screeningResults && !isScreening && (
              <Button
                onClick={handleSaveResults}
                disabled={saveScreeningResultMutation.isPending}
              >
                {saveScreeningResultMutation.isPending ? (
                  <>
                    <Brain className="mr-2 h-4 w-4 animate-pulse" />
                    Saving...
                  </>
                ) : (
                  "Save Analysis Results"
                )}
              </Button>
            )}
            {isScreening && (
              <Button disabled className="opacity-50">
                <Brain className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
