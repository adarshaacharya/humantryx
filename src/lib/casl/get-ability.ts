import { defineAbilitiesFor } from "./ability";
import type { AppAbility } from "./types";
import type { Employee } from "@/server/db/employees";

export async function getAbility(employee: Employee): Promise<AppAbility> {
  return defineAbilitiesFor(employee);
}
