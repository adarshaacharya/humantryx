import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import { authClient } from "@/server/auth/auth-client";

export default async function AcceptInvitationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const invitationId = (await params).id;

  const invitationDetails = await api.invitation.verify({ id: invitationId });

  // Get current session
  const { data: session, error: sessionError } = await authClient.getSession();

  if (sessionError) {
    redirect("/sign-in");
  }

  // If user is not logged in, redirect to login with returnTo
  if (!session?.user) {
    const returnTo = `/accept-invitation/${invitationId}`;
    redirect(`/sign-in?returnTo=${encodeURIComponent(returnTo)}`);
  }

  // Check if user email matches invitation email
  if (session.user.email !== invitationDetails.email) {
    redirect(
      `/?error=email-mismatch&invited=${encodeURIComponent(
        invitationDetails.email,
      )}&current=${encodeURIComponent(session.user.email)}`,
    );
  }

  // Accept the invitation
  const result = await authClient.organization.acceptInvitation({
    invitationId,
  });

  if (result.data) {
    redirect("/dashboard");
  }

  return null;
}

//http://localhost:3000/accept-invitation/9rPxJNoHgngLtycha4kCVAedppFVrCLp
