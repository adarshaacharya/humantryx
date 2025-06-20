import { useSession } from "@/server/auth/auth-client";
import { api } from "@/trpc/react";
import { skipToken } from "@tanstack/react-query";

export function useCurrentEmployee() {
  const { data } = useSession();

  const employee = api.employee.getCurrentEmployee.useQuery(
    !data?.session ? skipToken : undefined,
  );

  if (!employee.isLoading && !employee.data) {
    return;
  }

  return employee.data;
}
