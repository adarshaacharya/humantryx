import {
  AbilityBuilder,
  createMongoAbility,
  type CreateAbility,
} from "@casl/ability";
import type { Employee } from "../../server/db/employees";
import type { AppAbility } from "./types";

export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>;

export function defineAbilitiesFor(
  employee: Employee | null | undefined,
): AppAbility {
  if (!employee) {
    return createAppAbility([]);
  }

  const ability = new AbilityBuilder<AppAbility>(createAppAbility);

  // can = allow, cant = forbid
  switch (employee.designation) {
    case "founder":
      ability.can("manage", "all");
      break;

    case "hr":
      ability.can("manage", "Employee");
      ability.can(["create", "read", "update", "delete"], "Payroll");
      ability.can("manage", "SalarySettings");
      ability.can(["read", "create"], "Attendance");
      ability.can("manage", "LeaveRequests");
      ability.can("manage", "LeavePolicies");
      ability.can("manage", "News"); // HR can manage all news
      ability.can("manage", "Recruitment");
      ability.can("manage", "Documents");
      break;

    case "project_manager":
      ability.can(["read", "update"], "Employee");
      ability.can(["read", "create"], "Attendance");
      ability.can(["read", "create", "update"], "LeaveRequests");
      ability.can("read", "LeavePolicies");
      ability.can("read", "Payroll", {
        employeeId: employee.id,
      } as any);
      ability.can(["create", "read", "update", "delete"], "News");
      break;

    // for employees
    default:
      ability.can("read", "Organization", {
        id: employee.organizationId,
      } as any);
      ability.can("read", "Employee");
      ability.can(["create"], "LeaveRequests");
      ability.can("read", "LeavePolicies", {
        organizationId: employee.organizationId,
      } as any);
      ability.can("read", "LeaveRequests", {
        employeeId: employee.id,
      } as any);
      ability.can("read", "Attendance", {
        employeeId: employee.id,
      } as any);
      ability.can("read", "Payroll", { employeeId: employee.id } as any);
      ability.can("read", "SalarySettings", { employeeId: employee.id } as any);
      ability.can(["create", "read", "update", "delete"], "News");
      ability.can("read", "Documents"); // Regular employees can read documents

      break;
  }

  return ability.build();
}
