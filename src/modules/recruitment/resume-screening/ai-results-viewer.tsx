"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Eye,
  Brain,
  Target,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { AIRecommendation, JobApplicationType } from "../types";

interface AIResultsViewerProps {
  application: JobApplicationType;
  trigger?: React.ReactNode;
}

const getRecommendationColor = (recommendation: AIRecommendation) => {
  switch (recommendation) {
    case "shortlist":
      return "bg-green-100 text-green-800 border-green-200";

    case "reject":
      return "bg-red-100 text-red-800 border-red-200";
  }
};

const getRecommendationIcon = (recommendation: AIRecommendation) => {
  switch (recommendation) {
    case "shortlist":
      return <CheckCircle className="h-4 w-4" />;

    case "reject":
      return <XCircle className="h-4 w-4" />;
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-blue-600";
  if (score >= 40) return "text-yellow-600";
  return "text-red-600";
};

export function AIResultsViewer({
  application,
  trigger,
}: AIResultsViewerProps) {
  const aiResult = application.aiScreeningResult;

  if (!aiResult?.recommendation) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Eye className="mr-1 h-4 w-4" />
            View AI Results
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] min-w-6xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="text-primary h-5 w-5" />
            AI Screening Results for {application.candidateName}
          </DialogTitle>
          <p className="text-muted-foreground text-sm">
            Comprehensive analysis of candidate&apos;s qualifications and fit for the
            role
          </p>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5" />
                  Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Badge
                    className={`${getRecommendationColor(aiResult.recommendation)} border px-3 py-1`}
                  >
                    <span className="flex items-center gap-2">
                      {getRecommendationIcon(aiResult.recommendation)}
                      {aiResult.recommendation.toUpperCase()}
                    </span>
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5" />
                  Match Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-3xl font-bold ${getScoreColor(aiResult.matchScore ?? 0)}`}
                  >
                    {aiResult.matchScore}%
                  </span>
                  <div className="h-2 flex-1 rounded-full bg-gray-200">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        (aiResult.matchScore ?? 0) >= 80
                          ? "bg-green-500"
                          : (aiResult.matchScore ?? 0) >= 60
                            ? "bg-blue-500"
                            : (aiResult.matchScore ?? 0) >= 40
                              ? "bg-yellow-500"
                              : "bg-red-500"
                      }`}
                      style={{ width: `${aiResult.matchScore ?? 0}%` }}
                    />
                  </div>
                </div>
                {aiResult.confidence && (
                  <p className="text-muted-foreground mt-2 text-sm">
                    Confidence: {aiResult.confidence}%
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Skills Analysis */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Matched Skills */}
            {aiResult.matchedSkills && aiResult.matchedSkills.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    Matched Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {aiResult.matchedSkills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="border-green-200 bg-green-50 text-green-700"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Missing Skills */}
            {aiResult.missingSkills && aiResult.missingSkills.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg text-red-700">
                    <XCircle className="h-5 w-5" />
                    Missing Skills
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {aiResult.missingSkills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="border-red-200 bg-red-50 text-red-700"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* AI Summary */}
          {aiResult.summary && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Brain className="h-5 w-5" />
                  AI Analysis Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {aiResult.summary}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5" />
                Screening Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                {aiResult.screenedAt && (
                  <div>
                    <span className="text-muted-foreground font-medium">
                      Screened:
                    </span>
                    <p className="mt-1">
                      {formatDistanceToNow(new Date(aiResult.screenedAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-muted-foreground font-medium">
                    Application ID:
                  </span>
                  <p className="mt-1 font-mono text-xs">{application.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
