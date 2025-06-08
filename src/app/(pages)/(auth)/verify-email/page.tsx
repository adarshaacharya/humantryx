import { VerifyEmailForm } from "@/modules/auth/verify-email-form";
import { auth } from "@/server/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

interface VerifyEmailPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const params = await searchParams;
  const invitationId = params.invitation as string | undefined;

  if (!session?.user) {
    return redirect("/sign-in");
  }

  if (session?.user?.emailVerified) {
    // Redirect to auth-callback with invitation parameter if present
    const callbackUrl = invitationId
      ? `/auth-callback?invitation=${invitationId}`
      : "/auth-callback";
    return redirect(callbackUrl);
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <VerifyEmailForm />
    </div>
  );
}
