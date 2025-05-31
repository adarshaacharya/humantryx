import { authClient } from "./auth-client";

export const signinGithub = async () => {
  const data = await authClient.signIn.social({
    provider: "github",
  });
  return data;
};
