"use client";

import { motion } from "motion/react";
import { CheckCircle, ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function EmailVerifiedForm() {
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
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900"
          >
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </motion.div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Email Verified!
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Your email address has been successfully verified. You can now
              access all features of your account.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-4 text-center"
          >
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
              <p className="text-sm text-green-700 dark:text-green-300">
                ✓ Email verification complete
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                ✓ Account activated
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                ✓ Ready to sign in
              </p>
            </div>

            <div className="space-y-3">
              <Button asChild className="w-full" size="lg">
                <Link href="/sign-in" className="flex items-center gap-2">
                  Continue to Sign In
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                You will be redirected to the sign-in page where you can access
                your account.
              </p>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
