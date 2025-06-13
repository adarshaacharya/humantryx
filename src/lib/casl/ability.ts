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
      ability.can(["read", "create"], "Attendance");
      ability.can("manage", "Leave");
      break;

    case "project_manager":
      ability.can(["read", "update"], "Employee");
      ability.can(["read", "create"], "Attendance");
      ability.can(["read", "create", "update"], "Leave");
      break;

    // for employees
    default:
      ability.can("read", "Organization", {
        id: employee.organizationId,
      });
      ability.can(["create"], "Leave");
      ability.can("read", "Leave", {
        employeeId: employee.id,
      });
      ability.can("read", "Attendance", {
        employeeId: employee.id,
      });
      ability.can("read", "Payroll", { employeeId: employee.id });

      break;
  }

  return ability.build();
}
