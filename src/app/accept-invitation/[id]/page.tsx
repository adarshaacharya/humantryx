import { Suspense } from "react";
import { InvitationLandingPage } from "@/modules/invitations/invitation-landing-page";

export default async function AcceptInvitationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const invitationId = (await params).id;

  return (
    <Suspense fallback={<div>Loading invitation...</div>}>
      <InvitationLandingPage invitationId={invitationId} />
    </Suspense>
  );
}

