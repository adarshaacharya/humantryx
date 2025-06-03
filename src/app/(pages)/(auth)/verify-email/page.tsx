import { VerifyEmailForm } from "@/modules/auth/verify-email-form";
import { auth } from "@/server/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function VerifyEmailPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return redirect("/sign-in");
  }

  if (session?.user?.emailVerified) {
    return redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <VerifyEmailForm />
    </div>
  );
}
