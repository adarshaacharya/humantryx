"use client";

import { type ReactNode } from "react";
import type { Actions, Subjects } from "@/lib/casl/types";
import { useAbility } from "@/providers/ability-context";

type CanProps = {
  I: Actions;
  do?: Actions;
  on: Subjects;
  this?: any;
  children: ReactNode;
  fallback?: ReactNode;
};

export function Can({
  I: action,
  on,
  this: field,
  children,
  fallback = null,
}: CanProps) {
  const ability = useAbility();

  return ability.can(action, on, field) ? <>{children}</> : <>{fallback}</>;
}
