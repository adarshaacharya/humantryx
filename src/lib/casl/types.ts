import type { MongoAbility } from "@casl/ability";

export type Actions = "manage" | "create" | "read" | "update" | "delete";

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
  | "Organization";

export type AppAbility = MongoAbility<[Actions, Subjects]>;
