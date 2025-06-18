export const DOCUMENT_TYPES = [
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
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "text/csv",
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ] as const,
  ALLOWED_EXTENSIONS: [
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".txt",
    ".csv",
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
  ] as const,
} as const;
