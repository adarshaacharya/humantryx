"use client";
import { type ErrorContext } from "@better-fetch/fetch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  forgotPasswordSchema,
  type ForgotPasswordSchemaType,
} from "./schemas/auth";
import { authClient } from "@/server/auth/auth-client";
import { toast } from "sonner";
import { LoadingButton } from "@/components/ui/loading-button";
import { Mail, Brain } from "lucide-react";
import Link from "next/link";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [pending, setPending] = useState(false);

  const form = useForm<ForgotPasswordSchemaType>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleForgotPassword = async (values: ForgotPasswordSchemaType) => {
    await authClient.forgetPassword(
      {
        email: values.email,
        redirectTo: "/reset-password",
      },
      {
        onRequest: () => {
          setPending(true);
        },
        onSuccess: async () => {
          toast.success(
            "If an account exists, you will receive an email to reset your password.",
          );
        },
        onError: (ctx: ErrorContext) => {
          toast.error(ctx.error.message ?? "Something went wrong.");
        },
      },
    );

    setPending(false);
  };

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

      {/* Forgot Password Card */}
      <Card className="bg-card/80 border-0 shadow-2xl backdrop-blur-sm">
        <div className="from-primary/5 to-secondary/5 absolute inset-0 rounded-lg bg-gradient-to-br via-transparent" />
        <CardHeader className="relative pb-6">
          <CardTitle className="text-foreground text-center text-2xl">
            Reset Password
          </CardTitle>
          <CardDescription className="text-muted-foreground text-center">
            Enter your email below to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleForgotPassword)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          className="bg-background focus:border-primary border pl-10"
                          {...field}
                          autoComplete="email"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <LoadingButton type="submit" pending={pending} className="w-full">
                Send Reset Link
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
