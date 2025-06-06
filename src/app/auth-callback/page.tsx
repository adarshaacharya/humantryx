import { auth } from "@/server/auth";
import { AuthCallbackClient } from "./client";
import { headers } from "next/headers";

export default async function AuthCallbackPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return <AuthCallbackClient session={session} />;
}
