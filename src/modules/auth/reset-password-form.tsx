"use client";
import { type ErrorContext } from "@better-fetch/fetch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { resetPasswordSchema, type ResetPasswordSchemaType } from "./schemas";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { LoadingButton } from "@/components/ui/loading-button";
import { Input } from "@/components/ui/input";

function ResetPasswordFormNoSuspense({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invalid_token_error = searchParams.get("error");
  const token = searchParams.get("token");

  const [pending, setPending] = useState(false);

  const form = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const handleForgotPassword = async (values: ResetPasswordSchemaType) => {
    if (!token) {
      console.log("No token found!!!");
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

          router.push("/signin");
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
      <div className="flex grow items-center justify-center p-4">
        <Card className="bg-card/80 w-full max-w-md border-0 shadow-2xl backdrop-blur-sm">
          <div className="from-destructive/5 to-destructive/10 absolute inset-0 rounded-lg bg-gradient-to-br via-transparent" />
          <CardHeader className="relative">
            <CardTitle className="text-foreground text-center text-3xl font-bold">
              Invalid Reset Link
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-4">
              <p className="text-muted-foreground text-center">
                This password reset link is invalid or has expired.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-card/80 border-0 shadow-2xl backdrop-blur-sm">
        <div className="from-primary/5 to-secondary/5 absolute inset-0 rounded-lg bg-gradient-to-br via-transparent" />
        <CardHeader className="relative">
          <CardTitle className="text-foreground text-2xl">
            Reset Password
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleForgotPassword)}
              className="space-y-6"
            >
              {["password", "confirmPassword"].map((field) => (
                <FormField
                  control={form.control}
                  key={field}
                  name={field as keyof ResetPasswordSchemaType}
                  render={({ field: fieldProps }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        {field === "confirmPassword"
                          ? "Confirm Password"
                          : field.charAt(0).toUpperCase() + field.slice(1)}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type={
                            field === "password" || field === "confirmPassword"
                              ? "password"
                              : "email"
                          }
                          placeholder={
                            field === "confirmPassword"
                              ? "Confirm your password"
                              : `Enter your ${field}`
                          }
                          className="bg-background focus:border-primary border transition-all duration-200"
                          {...fieldProps}
                          autoComplete={"off"}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <LoadingButton type="submit" pending={pending} className="w-full">
                Reset Password
              </LoadingButton>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <Suspense>
      <ResetPasswordFormNoSuspense className={className} {...props} />
    </Suspense>
  );
}
