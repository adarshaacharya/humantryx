"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Mail,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { authClient } from "@/server/auth/auth-client";
import { toast } from "sonner";
import { useSession } from "@/server/auth/auth-client";
import { useRouter } from "next/navigation";

export function VerifyEmailForm() {
  const [isResending, setIsResending] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleResendVerification = async () => {
    if (!session?.user?.email) {
      toast.error("No email address found for verification");
      return;
    }

    setIsResending(true);

    await authClient
      .sendVerificationEmail({
        email: session?.user?.email,
      })
      .then(() => {
        toast.success("Verification email sent successfully");
      })
      .catch((error) => {
        console.error("Resend verification error:", error);
        toast.error("Failed to resend verification email");
      })
      .finally(() => {
        setIsResending(false);
      });
  };

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      router.push("/sign-in");
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <Card className="border-white/20 bg-white/95 shadow-xl backdrop-blur-sm dark:bg-gray-900/95">
        <CardHeader className="space-y-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900"
          >
            <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
          </motion.div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Email Verification Required
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Please verify your email address to continue using Humantryx
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Verification email sent to:
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {session?.user?.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                <p>Check your email inbox and spam folder</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                <p>Click the verification link in the email</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                <p>Return to this page to continue</p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleResendVerification}
                disabled={isResending}
                variant="outline"
                className="w-full"
                size="lg"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>

              <Button
                onClick={handleSignOut}
                variant="ghost"
                className="w-full"
                size="lg"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                💡 <strong>Tip:</strong> If you don&apos;t receive the email
                within a few minutes, check your spam folder or try resending
                the verification email.
              </p>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Need help?{" "}
                <Link
                  href="/contact"
                  className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  Contact Support
                </Link>
              </p>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
