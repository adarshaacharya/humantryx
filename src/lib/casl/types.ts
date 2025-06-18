import type { MongoAbility } from "@casl/ability";

export type Actions = "manage" | "create" | "read" | "update" | "delete";

export const subjects = [
  "all",
  "Employee",
  "Member",
  "Payroll",
  "SalarySettings",
  "Attendance",
  "LeaveRequests",
  "LeavePolicies",
  "Company",
  "AI",
  "Organization",
  "News",
  "Recruitment",
] as const;

export type Subjects =
  | "all"
  | "Employee"
  | "Member"
  | "Payroll"
  | "SalarySettings"
  | "Attendance"
  | "LeaveRequests"
  | "LeavePolicies"
  | "Company"
  | "AI"
  | "Organization"
  | "News"
  | "Recruitment"
  | "Documents"

export type AppAbility = MongoAbility<[Actions, Subjects]>;
