import { api } from "@/trpc/react";

export function useCurrentEmployee() {
  const employee = api.employee.getCurrentEmployee.useQuery();

  if (!employee.isLoading && !employee.data) {
    return;
  }

  return employee.data;
}
