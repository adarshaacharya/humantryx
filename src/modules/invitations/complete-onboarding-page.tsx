"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Building2 } from "lucide-react";
import { authClient } from "@/server/auth/auth-client";
import { motion } from "motion/react";

export function CompleteOnboardingPage() {
  const router = useRouter();
  const { data: currentOrg } = authClient.useActiveOrganization();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4 rounded-full bg-green-100 p-3"
            >
              <CheckCircle className="h-8 w-8 text-green-600" />
            </motion.div>
            <CardTitle className="text-2xl">Welcome to the team!</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 text-center">
            <div>
              <p className="text-gray-600">
                You&apos;ve successfully joined{" "}
                <strong>{currentOrg?.name}</strong>
              </p>
              <p className="mt-2 text-sm text-gray-500">
                You now have access to your organization&apos;s dashboard and
                can start collaborating with your team.
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 p-4">
              <Building2 className="mx-auto mb-2 h-6 w-6 text-blue-600" />
              <h3 className="font-medium text-blue-900">What&apos;s next?</h3>
              <ul className="mt-2 space-y-1 text-sm text-blue-700">
                <li>• Complete your profile</li>
                <li>• Explore your dashboard</li>
                <li>• Connect with your team</li>
              </ul>
            </div>

            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
