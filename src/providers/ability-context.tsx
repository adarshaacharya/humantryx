"use client";
import { useCurrentEmployee } from "@/hooks/use-current-employee";
import { defineAbilitiesFor } from "@/lib/casl/ability";
import type { AppAbility } from "@/lib/casl/types";
import { createContext, useContext, useEffect, useState } from "react";

export const AbilityContext = createContext<AppAbility>({} as AppAbility);

export function AbilityProvider({ children }: { children: React.ReactNode }) {
  const employee = useCurrentEmployee();

  const [ability, setAbility] = useState<AppAbility>(() =>
    defineAbilitiesFor(employee),
  );

  useEffect(() => {
    if (employee) {
      setAbility(defineAbilitiesFor(employee));
    }
  }, [employee]);

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
}

export const useAbility = () => {
  const context = useContext(AbilityContext);

  if (context === undefined)
    throw new Error("useAbility must be used within a AbilityProvider");

  return context;
};
