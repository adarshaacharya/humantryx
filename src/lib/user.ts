import { headers } from "next/headers";
import { auth } from "@/server/auth";

export const userProfile = async () => {
  const userSession = await auth.api.getSession({
    headers: await headers(),
  });

  return userSession;
};
