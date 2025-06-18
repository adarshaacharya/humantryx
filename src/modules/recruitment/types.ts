// Shared types for recruitment module

export type JobApplicationType = {
  id: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string | null;
  resumeUrl: string | null;
  coverLetter: string | null;
  status: "applied" | "shortlisted" | "interviewed" | "hired" | "rejected";
  appliedAt: Date;
  reviewedAt: Date | null;
  interviewDate: Date | null;
  reviewedByEmployee: {
    id: string | null;
    name: string | null;
  } | null;
  aiScreeningResult: {
    id: string | null;
    matchScore: number | null;
    confidence: number | null;
    recommendation: AIRecommendation | null;
    matchedSkills: string[] | null;
    missingSkills: string[] | null;
    summary: string | null;
    screenedAt: Date | null;
  } | null;
};

export type ApplicationStatus = "all" | "pending" | "screened";

export type AIRecommendation = "shortlist" | "reject";

export type AIScreeningResult = {
  id: string;
  matchScore: number;
  confidence: number;
  recommendation: AIRecommendation;
  matchedSkills: string[];
  missingSkills: string[];
  summary: string;
  aiModel?: string | null;
  processingTime?: number | null;
  screenedAt: Date;
  screenedByEmployee: {
    id: string | null;
    name: string | null;
  } | null;
};
