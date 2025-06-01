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
import { forgotPasswordSchema, type ForgotPasswordSchemaType } from "./schemas";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { LoadingButton } from "@/components/ui/loading-button";

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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-card/80 border-0 shadow-2xl backdrop-blur-sm">
        <div className="from-primary/5 to-secondary/5 absolute inset-0 rounded-lg bg-gradient-to-br via-transparent" />
        <CardHeader className="relative">
          <CardTitle className="text-foreground text-2xl">
            Reset Password
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your email below to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleForgotPassword)}
              className="space-y-6"
            >
              {["email"].map((field) => (
                <FormField
                  control={form.control}
                  key={field}
                  name={field as keyof ForgotPasswordSchemaType}
                  render={({ field: fieldProps }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        {field.charAt(0).toUpperCase() + field.slice(1)}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type={field === "password" ? "password" : "email"}
                          placeholder={`Enter your ${field}`}
                          className="bg-background focus:border-primary border transition-all duration-200"
                          {...fieldProps}
                          autoComplete={
                            field === "password" ? "current-password" : "email"
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <LoadingButton type="submit" pending={pending} className="w-full">
                Send Reset Link
              </LoadingButton>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
