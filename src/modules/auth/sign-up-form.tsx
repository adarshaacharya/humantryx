"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
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
  User,
} from "lucide-react";
import Link from "next/link";
import { authClient } from "@/server/auth/auth-client";
import { toast } from "sonner";
import { signUpSchema, type SignUpSchemaType } from "./schemas/auth";
import { Logo } from "@/components/logo";
import { env } from "@/env";

const passwordStrength = (password: string) => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return strength;
};

const getStrengthColor = (strength: number) => {
  if (strength < 2) return "bg-destructive";
  if (strength < 4) return "bg-orange-500";
  return "bg-green-500";
};

const getStrengthText = (strength: number) => {
  if (strength < 2) return "Weak";
  if (strength < 4) return "Medium";
  return "Strong";
};

export function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const invitationId = searchParams.get("invitation");
  const prefilledEmail = searchParams.get("email");

  const form = useForm<SignUpSchemaType>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Pre-fill email if provided from invitation
  useEffect(() => {
    if (prefilledEmail) {
      form.setValue("email", prefilledEmail);
    }
  }, [prefilledEmail, form]);

  const handleSubmit = async (values: SignUpSchemaType) => {
    if (!acceptTerms) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    setIsLoading(true);

    try {
      // Build custom callback URL with invitation parameter if present
      let customCallbackURL = `${env.NEXT_PUBLIC_APP_URL}/auth-callback`;
      if (invitationId) {
        customCallbackURL = `${env.NEXT_PUBLIC_APP_URL}/auth-callback?invitation=${invitationId}`;
      }

      const { data, error } = await authClient.signUp.email({
        email: values.email,
        password: values.password,
        name: values.name,
        callbackURL: customCallbackURL,
      });

      if (error) {
        if (error.status === 400 && error.message?.includes("email")) {
          toast.error("An account with this email already exists");
        } else {
          toast.error(error.message ?? "Failed to create account");
        }
        return;
      }

      if (data) {
        toast.success(
          "Account created successfully! Please check your email to verify your account.",
        );
        // Navigate to verify-email page, with invitation parameter if present
        const verifyEmailUrl = invitationId
          ? `/verify-email?invitation=${invitationId}`
          : "/verify-email";
        router.push(verifyEmailUrl);
      }
    } catch (err) {
      console.error("Sign up error:", err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg">
      <div className="mb-8 flex flex-col items-center space-y-2">
        <Logo size="lg" />
      </div>

      {/* Sign Up Card */}
      <Card className="bg-card/80 border-0 shadow-2xl backdrop-blur-sm">
        <div className="from-primary/5 to-secondary/5 absolute inset-0 rounded-lg bg-gradient-to-br via-transparent" />
        <CardHeader className="relative pb-6">
          <CardTitle className="text-foreground text-center text-2xl">
            Get Started
          </CardTitle>
          <CardDescription className="text-muted-foreground text-center">
            Please create your account to continue.
          </CardDescription>
        </CardHeader>

        <CardContent className="relative">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {/* Full Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Full Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                        <Input
                          type="text"
                          placeholder="Enter your full name"
                          className="bg-background focus:border-primary border pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                          className="bg-background focus:border-primary border pl-10"
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
                    <FormLabel className="text-foreground">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          className="bg-background focus:border-primary border pr-10 pl-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transform"
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

                    {/* Password Strength Indicator */}
                    {field.value && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="bg-muted h-2 flex-1 rounded-full">
                            <div
                              className={`h-2 rounded-full ${getStrengthColor(
                                passwordStrength(field.value),
                              )}`}
                              style={{
                                width: `${(passwordStrength(field.value) / 5) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-muted-foreground min-w-[60px] text-xs">
                            {getStrengthText(passwordStrength(field.value))}
                          </span>
                        </div>
                      </div>
                    )}
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
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          className="bg-background focus:border-primary border pr-10 pl-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transform"
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

                    {/* Password Match Indicator */}
                    {field.value && form.watch("password") && (
                      <div className="flex items-center gap-2 text-xs">
                        {form.watch("password") === field.value ? (
                          <>
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span className="text-green-500">
                              Passwords match
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="text-destructive h-3 w-3" />
                            <span className="text-destructive">
                              Passwords do not match
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </FormItem>
                )}
              />

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) =>
                    setAcceptTerms(checked as boolean)
                  }
                  className="mt-1"
                />
                <label
                  htmlFor="terms"
                  className="text-muted-foreground text-sm leading-relaxed"
                >
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-primary hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <div className="border-background mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              {/* Sign In Link */}
              <div className="text-center">
                <span className="text-muted-foreground">
                  Already have an account?{" "}
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
