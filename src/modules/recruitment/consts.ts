import type {
  jobStatusEnum,
  jobLocationTypeEnum,
  applicationStatusEnum,
} from "@/server/db/recruitment";

export type JobStatus = (typeof jobStatusEnum.enumValues)[number];
export type JobLocationType = (typeof jobLocationTypeEnum.enumValues)[number];
export type ApplicationStatus =
  (typeof applicationStatusEnum.enumValues)[number];

export const JOB_STATUSES: readonly {
  label: string;
  value: JobStatus;
  variant: "default" | "secondary" | "destructive" | "outline";
}[] = [
  { label: "Draft", value: "draft", variant: "outline" },
  { label: "Open", value: "open", variant: "default" },
  { label: "Closed", value: "closed", variant: "secondary" },
] as const;

export const JOB_LOCATION_TYPES: readonly {
  label: string;
  value: JobLocationType;
  icon: string;
}[] = [
  { label: "Remote", value: "remote", icon: "🏠" },
  { label: "On-site", value: "onsite", icon: "🏢" },
  { label: "Hybrid", value: "hybrid", icon: "🔄" },
] as const;

export const APPLICATION_STATUSES: readonly {
  label: string;
  value: ApplicationStatus;
  variant: "default" | "secondary" | "destructive" | "outline";
}[] = [
  { label: "Applied", value: "applied", variant: "outline" },
  { label: "Shortlisted", value: "shortlisted", variant: "default" },
  { label: "Interviewed", value: "interviewed", variant: "secondary" },
  { label: "Hired", value: "hired", variant: "default" },
  { label: "Rejected", value: "rejected", variant: "destructive" },
] as const;

export const COMMON_SKILLS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Python",
  "Java",
  "AWS",
  "Docker",
  "Kubernetes",
  "PostgreSQL",
  "MongoDB",
  "GraphQL",
  "REST APIs",
  "Git",
  "Agile",
  "Scrum",
  "Project Management",
  "Communication",
  "Problem Solving",
  "Leadership",
] as const;

export const EXPERIENCE_LEVELS = [
  "0-1 years",
  "1-2 years",
  "2-4 years",
  "4-6 years",
  "6-8 years",
  "8-10 years",
  "10+ years",
] as const;

export const SALARY_CURRENCIES = [
  { label: "USD", value: "USD", symbol: "$" },
  { label: "EUR", value: "EUR", symbol: "€" },
  { label: "GBP", value: "GBP", symbol: "£" },
  { label: "INR", value: "INR", symbol: "₹" },
  { label: "CAD", value: "CAD", symbol: "C$" },
  { label: "AUD", value: "AUD", symbol: "A$" },
] as const;

export const getRecommendationVariant = (recommendation: string) => {
  switch (recommendation) {
    case "hire":
      return "default";
    case "interview":
      return "secondary";
    case "reject":
      return "destructive";
    default:
      return "outline";
  }
};

export const getStatusVariant = (status: string) => {
  const statusConfig = JOB_STATUSES.find((s) => s.value === status);
  return statusConfig?.variant || "default";
};

export const getLocationIcon = (locationType: string) => {
  const locationConfig = JOB_LOCATION_TYPES.find(
    (l) => l.value === locationType,
  );
  return locationConfig?.icon || "🏢";
};

export const formatSalaryRange = (
  min?: number | null,
  max?: number | null,
  currency : string | null = "USD",
) => {
  if (!min && !max) return null;

  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency : currency || "USD",
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
