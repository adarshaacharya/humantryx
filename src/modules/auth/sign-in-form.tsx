"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Brain,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/server/auth/auth-client";
import { toast } from "sonner";
import { signInSchema, type SignInSchemaType } from "./schemas/auth";
import { Logo } from "@/components/logo";

export function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const invitationId = searchParams.get("invitation");
  const prefilledEmail = searchParams.get("email");

  const form = useForm<SignInSchemaType>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  // Pre-fill email if provided from invitation
  useEffect(() => {
    if (prefilledEmail) {
      form.setValue("email", prefilledEmail);
    }
  }, [prefilledEmail, form]);

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: SignInSchemaType) => {
    setError(null);

    try {
      // Build custom callback URL with invitation parameter if present
      let customCallbackURL = "/auth-callback";
      if (invitationId) {
        customCallbackURL = `/auth-callback?invitation=${invitationId}`;
      }

      const { data, error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
        callbackURL: customCallbackURL,
      });

      if (error) {
        if (error.status === 403) {
          setError("Please verify your email address before signing in.");
          toast.error("Email verification required");
          // Redirect to verify-email page with invitation parameter if present
          const verifyEmailUrl = invitationId
            ? `/verify-email?invitation=${invitationId}`
            : "/verify-email";
          router.push(verifyEmailUrl);
        } else {
          setError(error.message ?? "Invalid email or password");
          toast.error("Sign in failed");
        }
        return;
      }

      if (data) {
        toast.success("Welcome back!");
        // The callbackURL will handle the redirection automatically
        // No need for manual redirection here
      }
    } catch (err) {
      console.error("Sign in error:", err);
      setError("An unexpected error occurred. Please try again.");
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="relative w-full max-w-md">
      {/* Background Gradient Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="bg-primary/5 absolute top-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full blur-3xl" />
        <div className="bg-primary/3 absolute right-0 bottom-0 h-64 w-64 rounded-full blur-2xl" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 flex flex-col items-center space-y-2 text-center"
      >
        <Logo size="lg" />
      </motion.div>

      {/* Sign In Card */}
      <div className="relative">
        <div className="from-primary/20 via-primary/10 to-primary/20 absolute inset-0 rounded-xl bg-gradient-to-r p-[1px]">
          <div className="bg-card/95 h-full w-full rounded-xl backdrop-blur-xl" />
        </div>

        <Card className="bg-card/95 relative border-0 shadow-2xl backdrop-blur-xl">
          <CardHeader className="pb-6">
            <CardTitle className="text-card-foreground text-center text-2xl">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-muted-foreground text-center">
              Sign in to continue to your dashboard
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Error Message */}
                {error && (
                  <div className="border-destructive/20 bg-destructive/5 text-destructive flex items-center gap-2 rounded-lg border p-3 backdrop-blur-sm">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            className="bg-background focus:border-primary border pl-10 transition-all duration-200"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="bg-background focus:border-primary border pr-10 pl-10 transition-all duration-200"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transform transition-colors"
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

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-y-0 space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-muted-foreground cursor-pointer text-sm">
                          Remember me
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => router.push("/forgot-password")}
                    className="text-primary hover:text-primary/80 text-sm transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 h-12 w-full border-0 bg-gradient-to-r shadow-lg transition-all duration-200 hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm">
                Don&apos;t have an account?{" "}
                <Link
                  href="/sign-up"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Create one here
                </Link>
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="text-muted-foreground mt-6 flex items-center justify-center space-x-4 text-xs">
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-3 w-3" />
                <span>Secure Login</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-3 w-3" />
                <span>256-bit SSL</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Back to Home */}
      <div className="mt-6 text-center">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground text-sm transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
