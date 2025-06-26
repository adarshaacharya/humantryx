"use client";
import { type ErrorContext } from "@better-fetch/fetch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  resetPasswordSchema,
  type ResetPasswordSchemaType,
} from "./schemas/auth";
import { authClient } from "@/server/auth/auth-client";
import { toast } from "sonner";
import { LoadingButton } from "@/components/ui/loading-button";
import { Input } from "@/components/ui/input";
import { Lock, Brain, ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";

function ResetPasswordFormNoSuspense() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invalid_token_error = searchParams.get("error");
  const token = searchParams.get("token");

  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const handleForgotPassword = async (values: ResetPasswordSchemaType) => {
    if (!token) {
      toast.error("No reset token provided. Please try again.");
      return;
    }

    await authClient.resetPassword(
      {
        newPassword: values.password,
        token,
      },
      {
        onRequest: () => {
          setPending(true);
        },
        onSuccess: async () => {
          toast.success(
            "Password reset successful. You can now log in with your new password.",
          );

          router.push("/sign-in");
        },
        onError: (ctx: ErrorContext) => {
          toast.error(ctx.error.message ?? "Something went wrong.");
        },
      },
    );

    setPending(false);
  };

  if (invalid_token_error === "INVALID_TOKEN" || !token) {
    return (
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center">
            <Logo className="h-8 w-8" />
          </Link>
        </div>

        {/* Invalid Token Card */}
        <Card className="bg-card/80 border-0 shadow-2xl backdrop-blur-sm">
          <div className="from-destructive/5 to-destructive/10 absolute inset-0 rounded-lg bg-gradient-to-br via-transparent" />
          <CardHeader className="relative pb-6">
            <CardTitle className="text-foreground text-center text-2xl">
              Invalid Reset Link
            </CardTitle>
            <CardDescription className="text-muted-foreground text-center">
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            {" "}
            <div className="space-y-4 text-center">
              <p className="text-muted-foreground">
                Please request a new password reset link.
              </p>
              <Link href="/forgot-password" className="inline-block w-full">
                <LoadingButton pending={false} className="w-full">
                  Request New Reset Link
                  <ArrowRight className="ml-2 h-4 w-4" />
                </LoadingButton>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg">
      {/* Header */}
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center">
          <div className="relative">
            <Brain className="text-primary h-8 w-8" />
            <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-400" />
          </div>
          <span className="text-foreground ml-2 text-xl font-bold">
            Humantryx
          </span>
        </Link>
      </div>

      {/* Reset Password Card */}
      <Card className="bg-card/80 border-0 shadow-2xl backdrop-blur-sm">
        <div className="from-primary/5 to-secondary/5 absolute inset-0 rounded-lg bg-gradient-to-br via-transparent" />
        <CardHeader className="relative pb-6">
          <CardTitle className="text-foreground text-center text-2xl">
            Set New Password
          </CardTitle>
          <CardDescription className="text-muted-foreground text-center">
            Enter your new password to complete the reset process
          </CardDescription>
        </CardHeader>

        <CardContent className="relative">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleForgotPassword)}
              className="space-y-6"
            >
              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">
                      New Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your new password"
                          className="bg-background focus:border-primary border pr-10 pl-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password Field */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">
                      Confirm New Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your new password"
                          className="bg-background focus:border-primary border pr-10 pl-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <LoadingButton type="submit" pending={pending} className="w-full">
                Reset Password
              </LoadingButton>

              {/* Sign In Link */}
              <div className="text-center">
                <span className="text-muted-foreground">
                  Remember your password?{" "}
                  <Link
                    href="/sign-in"
                    className="text-primary font-medium hover:underline"
                  >
                    Sign in here
                  </Link>
                </span>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Back to Home */}
      <div className="mt-8 text-center">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense>
      <ResetPasswordFormNoSuspense />
    </Suspense>
  );
}
