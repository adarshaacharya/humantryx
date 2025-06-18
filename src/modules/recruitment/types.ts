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
};

export type ApplicationStatus = "all" | "pending" | "screened";
