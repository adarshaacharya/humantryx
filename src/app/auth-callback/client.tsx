"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle } from "lucide-react";
import { type Session } from "@/server/auth";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function AuthCallbackClient({ session }: { session: Session | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (session?.user?.emailVerified) {
      // Check for invitation ID in URL parameters instead of sessionStorage
      const invitationId = searchParams.get("invitation");

      if (invitationId) {
        void router.push(`/accept-invitation/${invitationId}`);
      } else {
        void router.push("/dashboard");
      }
    }
  }, [session, router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="space-y-4 text-center">
            {session?.user?.emailVerified ? (
              <>
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <h2 className="text-xl font-semibold">Email Verified!</h2>
                <p className="text-gray-600">Redirecting you...</p>
              </>
            ) : (
              <>
                <Loader2 className="text-primary mx-auto h-12 w-12 animate-spin" />
                <h2 className="text-xl font-semibold">
                  Verifying your email...
                </h2>
                <p className="text-gray-600">
                  Please wait while we confirm your email address.
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
