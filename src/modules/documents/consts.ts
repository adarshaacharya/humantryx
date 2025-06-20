import type { DocumentType } from "@/server/db/documents";

export const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: "policy", label: "Policy" },
  { value: "handbook", label: "Employee Handbook" },
  { value: "form", label: "Form" },
  { value: "contract", label: "Contract" },
  { value: "notice", label: "Notice" },
  { value: "procedure", label: "Procedure" },
  { value: "manual", label: "Manual" },
  { value: "other", label: "Other" },
] as const;

export const VISIBILITY_LEVELS = [
  { value: "all", label: "All (Public)" },
  { value: "employees", label: "All Employees" },
  { value: "managers", label: "Managers Only" },
  { value: "hr", label: "HR Only" },
  { value: "private", label: "Private" },
] as const;

export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    "application/pdf",
    "application/msword",
    "text/plain",
    // pptx
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    // docx
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ] as const,

  ALLOWED_EXTENSIONS: [
    ".pdf",
    ".doc",
    ".docx",
    ".pptx",
    ".txt",
    ".md",
  ] as const,
} as const;
