import { TRPCError } from "@trpc/server";
import { defineAbilitiesFor } from "../../../lib/casl/ability";
import type { protectedProcedure } from "../trpc";
import { EmployeeService } from "../services/employee.service";
import type { AppAbility } from "@/lib/casl/types";

type MiddlewareFunction = Parameters<typeof protectedProcedure.use>[0];

//@ts-expect-error idk how to type this properly
type Option = Parameters<MiddlewareFunction>[0];

export const accessControl = <T>(
  callback: (_option: T, ability: AppAbility) => Promise<boolean>,
) => {
  return async (option: T) => {
    const opt = option as Option;
    const session = opt.ctx.session;

    if (!session.session.activeOrganizationId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Active organization membership required.",
      });
    }

    const employee = await EmployeeService.getCurrentEmployee({
      organizationId: session.session.activeOrganizationId,
      userId: session.user.id,
    });

    if (!employee) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Employee not found in the organization.",
      });
    }

    const ability = defineAbilitiesFor(employee);

    const hasAccess = await callback(option, ability);
    if (!hasAccess) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Insufficient permissions for this action.",
      });
    }

    return opt.next({
      ctx: {
        ...opt.ctx,
        ability,
        employee,
      },
    });
  };
};
