import { createAuthClient } from "better-auth/react";
import { env } from "@/env";
import { adminClient, organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [adminClient(), organizationClient()],
});

export const { signIn, signOut, useSession } = authClient;
