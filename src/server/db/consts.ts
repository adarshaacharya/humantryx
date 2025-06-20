import {
  type employeeDesignationEnum,
  type employeeStatusEnum,
  type employeeDepartmentEnum,
} from "./employees";
import type { orgMemberRole, invitationRole } from "./organizations";

export type OrgMemberRole = (typeof orgMemberRole.enumValues)[number];

export type InvitationRole = (typeof invitationRole.enumValues)[number];

export type EmployeeStatus = (typeof employeeStatusEnum.enumValues)[number];
export type EmployeeDepartment =
  (typeof employeeDepartmentEnum.enumValues)[number];
export type EmployeeDesignation =
  (typeof employeeDesignationEnum.enumValues)[number];

export const EMPLOYEE_DESIGNATIONS: readonly {
  label: string;
  value: EmployeeDesignation;
}[] = [
  { label: "Software Engineer", value: "software_engineer" },
  { label: "Product Manager", value: "product_manager" },
  { label: "Designer", value: "designer" },
  { label: "Data Scientist", value: "data_scientist" },
  { label: "Quality Assurance", value: "quality_assurance" },
  { label: "DevOps Engineer", value: "devops_engineer" },
  { label: "System Administrator", value: "system_administrator" },
  { label: "Business Analyst", value: "business_analyst" },
  { label: "Project Manager", value: "project_manager" },
  { label: "HR", value: "hr" },
  { label: "Founder", value: "founder" },
] as const;

export const EMPLOYEE_DEPARTMENTS: readonly {
  label: string;
  value: EmployeeDepartment;
}[] = [
  { label: "Engineering", value: "engineering" },
  { label: "Product", value: "product" },
  { label: "System Administration", value: "system_administration" },
  { label: "Business Analysis", value: "business_analysis" },
  { label: "Founder Office", value: "founder_office" },
  { label: "Human Resources", value: "human_resources" },
] as const;
