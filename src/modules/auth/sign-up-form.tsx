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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export function SignUpForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleInputChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (error) setError(null);
    };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Full name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email address is required");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (!acceptTerms) {
      setError("Please accept the terms and conditions");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await authClient.signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        callbackURL: "/dashboard",
      });

      if (error) {
        if (error.status === 400 && error.message?.includes("email")) {
          setError("An account with this email already exists");
          toast.error("Email already registered");
        } else {
          setError(error.message ?? "Failed to create account");
          toast.error("Sign up failed");
        }
        return;
      }

      if (data) {
        toast.success(
          "Account created successfully! Please check your email to verify your account.",
        );
        router.push("/sign-in?message=verify-email");
      }
    } catch (err) {
      console.error("Sign up error:", err);
      setError("An unexpected error occurred. Please try again.");
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

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
    if (strength < 2) return "bg-red-500";
    if (strength < 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = (strength: number) => {
    if (strength < 2) return "Weak";
    if (strength < 4) return "Medium";
    return "Strong";
  };

  return (
    <div className="w-full max-w-md">
      {/* Background Effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          className="absolute h-96 w-96 rounded-full bg-gradient-to-r from-blue-500/5 to-cyan-500/5 blur-3xl dark:from-blue-500/10 dark:to-cyan-500/10"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ top: "10%", left: "10%" }}
        />
        <motion.div
          className="absolute h-80 w-80 rounded-full bg-gradient-to-r from-purple-500/5 to-pink-500/5 blur-3xl dark:from-purple-500/10 dark:to-pink-500/10"
          animate={{
            x: [0, -80, 0],
            y: [0, 80, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ bottom: "10%", right: "10%" }}
        />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mb-8 text-center"
      >
        <Link href="/" className="mb-8 inline-flex items-center">
          <div className="relative">
            <Brain className="h-8 w-8 text-blue-600 dark:text-cyan-400" />
            <motion.div
              className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-400"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <span className="ml-2 text-xl font-bold text-slate-900 dark:text-white">
            Human Loop
          </span>
        </Link>
      </motion.div>

      {/* Sign Up Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative z-10"
      >
        <Card className="border-slate-200 bg-white/80 shadow-xl backdrop-blur-sm dark:border-white/20 dark:bg-white/10 dark:shadow-2xl dark:backdrop-blur-lg">
          <CardHeader className="pb-6">
            <CardTitle className="text-center text-2xl text-slate-900 dark:text-white">
              Get Started
            </CardTitle>
            <CardDescription className="text-center text-slate-600 dark:text-blue-200">
              Create your account to continue
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300"
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}

              {/* Full Name Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-slate-900 dark:text-white"
                >
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-500 dark:text-blue-300" />
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange("name")}
                    placeholder="Enter your full name"
                    className="border-slate-200 bg-white pl-10 text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500 dark:border-white/20 dark:bg-white/5 dark:text-white dark:placeholder:text-blue-300 dark:focus:border-cyan-400 dark:focus:ring-cyan-400"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-slate-900 dark:text-white"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-500 dark:text-blue-300" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange("email")}
                    placeholder="Enter your email"
                    className="border-slate-200 bg-white pl-10 text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500 dark:border-white/20 dark:bg-white/5 dark:text-white dark:placeholder:text-blue-300 dark:focus:border-cyan-400 dark:focus:ring-cyan-400"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-slate-900 dark:text-white"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-500 dark:text-blue-300" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange("password")}
                    placeholder="Create a strong password"
                    className="border-slate-200 bg-white pr-10 pl-10 text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500 dark:border-white/20 dark:bg-white/5 dark:text-white dark:placeholder:text-blue-300 dark:focus:border-cyan-400 dark:focus:ring-cyan-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 transform text-slate-500 transition-colors hover:text-slate-700 dark:text-blue-300 dark:hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/20">
                        <div
                          className={`h-full transition-all duration-300 ${getStrengthColor(passwordStrength(formData.password))}`}
                          style={{
                            width: `${(passwordStrength(formData.password) / 5) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-slate-600 dark:text-blue-200">
                        {getStrengthText(passwordStrength(formData.password))}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-slate-900 dark:text-white"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-500 dark:text-blue-300" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleInputChange("confirmPassword")}
                    placeholder="Confirm your password"
                    className="border-slate-200 bg-white pr-10 pl-10 text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500 dark:border-white/20 dark:bg-white/5 dark:text-white dark:placeholder:text-blue-300 dark:focus:border-cyan-400 dark:focus:ring-cyan-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 transform text-slate-500 transition-colors hover:text-slate-700 dark:text-blue-300 dark:hover:text-white"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Password Match Indicator */}
                {formData.confirmPassword && (
                  <div className="flex items-center gap-2 text-xs">
                    {formData.password === formData.confirmPassword ? (
                      <>
                        <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                        <span className="text-green-600 dark:text-green-400">
                          Passwords match
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 text-red-600 dark:text-red-400" />
                        <span className="text-red-600 dark:text-red-400">
                          Passwords do not match
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="acceptTerms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) =>
                    setAcceptTerms(checked as boolean)
                  }
                  className="mt-1 border-slate-300 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500 dark:border-white/20 dark:data-[state=checked]:border-cyan-500 dark:data-[state=checked]:bg-cyan-500"
                />
                <Label
                  htmlFor="acceptTerms"
                  className="cursor-pointer text-sm leading-relaxed text-slate-600 dark:text-blue-200"
                >
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-blue-600 underline hover:text-blue-500 dark:text-cyan-300 dark:hover:text-cyan-200"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-blue-600 underline hover:text-blue-500 dark:text-cyan-300 dark:hover:text-cyan-200"
                  >
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 w-full border-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 dark:from-cyan-500 dark:to-blue-500 dark:hover:from-cyan-600 dark:hover:to-blue-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600 dark:text-blue-200">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="font-medium text-blue-600 transition-colors hover:text-blue-500 dark:text-cyan-300 dark:hover:text-cyan-200"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Back to Home */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-6 text-center"
      >
        <Link
          href="/"
          className="text-sm text-slate-500 transition-colors hover:text-slate-700 dark:text-blue-300 dark:hover:text-blue-200"
        >
          ← Back to Home
        </Link>
      </motion.div>
    </div>
  );
}
