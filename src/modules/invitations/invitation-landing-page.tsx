"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Mail, UserPlus, ArrowRight, Loader2 } from "lucide-react";
import { api } from "@/trpc/react";
import { authClient } from "@/server/auth/auth-client";
import { toast } from "sonner";

interface InvitationLandingPageProps {
  invitationId: string;
}

export function InvitationLandingPage({
  invitationId,
}: InvitationLandingPageProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const completeOnboardMutation =
    api.invitation.completeOnboarding.useMutation();

  const invitationQuery = api.invitation.verify.useQuery(
    { id: invitationId },
    {
      retry(failureCount, error) {
        // dont retry if error code is  BAD_REQUEST
        if (error.data?.code === "BAD_REQUEST") {
          return false;
        }
        return failureCount < 3; // Retry up to 3 times
      },
    },
  );

  const { data: session } = authClient.useSession();

  const handleAcceptInvitation = useCallback(async () => {
    if (!session?.user) {
      router.push(`/sign-up?invitation=${invitationId}`);
      return;
    }

    if (session.user.email !== invitationQuery.data?.email) {
      toast.error("This invitation was sent to a different email address");
      return;
    }

    setIsProcessing(true);

    try {
      const invitation = await authClient.organization.acceptInvitation({
        invitationId,
      });

      if (invitation.data) {
        toast.success("Successfully joined the organization!");

        const onboarded = await completeOnboardMutation.mutateAsync({
          organizationId: invitation.data?.invitation.organizationId,
          invitationId: invitation.data?.invitation.id,
        });

        if (onboarded) {
          router.push(`/accept-invitation/${invitationId}/complete`);
          toast.success("Onboarding completed successfully!");
        }
      }
    } catch (error) {
      toast.error("Failed to accept invitation");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  }, [session?.user, invitationQuery.data?.email, invitationId]);

  // Auto-accept invitation if user just signed up and email matches
  useEffect(() => {
    if (
      session?.user &&
      invitationQuery.data &&
      session.user.email === invitationQuery.data.email &&
      !isProcessing
    ) {
      // Auto-accept the invitation for authenticated users with matching email
      void handleAcceptInvitation();
    }
  }, [session?.user, invitationQuery.data, invitationId]);

  if (invitationQuery.error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Mail className="mx-auto mb-4 h-12 w-12 text-red-400" />
              <h2 className="mb-2 text-xl font-semibold">Invalid Invitation</h2>
              <p className="mb-4 text-gray-600">
                This invitation has expired or is no longer valid.
              </p>
              <Button onClick={() => router.push("/")}>Go to Homepage</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (invitationQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="text-primary mx-auto mb-4 h-8 w-8 animate-spin" />
              <p>Loading invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const invitation = invitationQuery.data;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 rounded-full bg-blue-100 p-3">
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">You&apos;re Invited!</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600">
              You&apos;ve been invited to join{" "}
              <strong>{invitation?.organization?.name}</strong>
            </p>
            {invitation?.role && (
              <div className="mt-2">
                <span className="text-sm text-gray-500">as </span>
                <Badge variant="secondary" className="capitalize">
                  {invitation.role}
                </Badge>
              </div>
            )}
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Invitation sent to:</span>
              <span className="font-medium">{invitation?.email}</span>
            </div>
          </div>

          {session?.user ? (
            <div className="space-y-4">
              {session.user.email === invitation?.email ? (
                <div className="text-center">
                  <p className="mb-4 text-sm text-green-600">
                    ✓ Signed in as {session.user.email}
                  </p>
                  <Button
                    onClick={handleAcceptInvitation}
                    disabled={isProcessing}
                    className="w-full"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Joining...
                      </>
                    ) : (
                      <>
                        Accept Invitation
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="mb-4 text-sm text-amber-600">
                    You&apos;re signed in as {session.user.email}, but this
                    invitation was sent to {invitation?.email}
                  </p>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      onClick={() => authClient.signOut()}
                      className="w-full"
                    >
                      Sign out and continue
                    </Button>
                    <p className="text-xs text-gray-500">
                      You&apos;ll need to sign in with the invited email address
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                onClick={() => {
                  router.push(
                    `/sign-up?email=${encodeURIComponent(invitation?.email ?? "")}&invitation=${invitationId}`,
                  );
                }}
                className="w-full"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Create Account & Join
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">or</span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  router.push(
                    `/sign-in?email=${encodeURIComponent(invitation?.email ?? "")}&invitation=${invitationId}`,
                  );
                }}
                className="w-full"
              >
                Sign In to Accept
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
