"use client";

import type { AppAbility, subjects } from "@/lib/casl/types";
import { AbilityContext } from "@/providers/ability-context";
import { createContextualCan } from "@casl/react";
import { subject as caslSubject } from "@casl/ability";

export const Can = createContextualCan<AppAbility>(AbilityContext.Consumer);


/**
 *
 * usage :   <Can I="moderate" this={subject("roles", { role })}> {children} </Can>
 *
 */
export const subject = <T extends (typeof subjects)[number]>(
  type: T,
  object: string | object,
) => {
  object = typeof object === "string" ? { [type]: object } : object;
  return caslSubject(type, object);
};
