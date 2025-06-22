"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Building2, Users, ArrowRight, Plus, UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  organizationSelectionSchema,
  type OrganizationSelectionSchemaType,
} from "./schemas/org";
import { api } from "@/trpc/react";
import { motion } from "motion/react";
import slugify from "slugify";
import { Logo } from "@/components/logo";

export function OrganizationSetupForm() {
  const [selectedAction, setSelectedAction] = useState<
    "create" | "join" | null
  >("create");
  const router = useRouter();

  // Check if user already has an organization
  const {
    data: orgStatus,
    isLoading: isCheckingOrg,
    error,
  } = api.organization.hasOrganization.useQuery(undefined, {
    retry: false,
    retryOnMount: false,
  });

  useEffect(() => {
    if (orgStatus?.hasOrganization) {
      router.push("/dashboard");
    }
  }, [orgStatus, router]);

  const form = useForm<OrganizationSelectionSchemaType>({
    resolver: zodResolver(organizationSelectionSchema),
    defaultValues: {
      action: "create",
      organizationData: {
        name: "",
        slug: "",
      },
      joinData: {
        inviteCode: "",
      },
    },
  });

  const createOrg = api.organization.create.useMutation({
    onSuccess: () => {
      toast.success("Organization created successfully!");
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to create organization");
    },
  });

  const joinOrg = api.organization.join.useMutation({
    onSuccess: () => {
      toast.success("Successfully joined organization!");
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to join organization");
    },
  });

  const handleSubmit = async (values: OrganizationSelectionSchemaType) => {
    if (values.action === "create" && values.organizationData) {
      createOrg.mutate({
        action: "create",
        organizationData: {
          name: values.organizationData.name,
          slug: values.organizationData.slug ?? undefined,
        },
      });
    } else if (values.action === "join" && values.joinData) {
      joinOrg.mutate({
        action: "join",
        joinData: {
          inviteCode: values.joinData.inviteCode,
        },
      });
    }
  };

  // Show loading while checking organization status (only if authenticated)
  if (isCheckingOrg && !error) {
    return (
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <Logo className="mx-auto h-16 w-16" />
          <h1 className="text-foreground mt-4 text-3xl font-bold">
            Checking your organization status...
          </h1>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-8 text-center">
        <div className="mb-4 flex items-center justify-center">
          <Logo size="md" />
        </div>
        <h1 className="text-foreground mt-4 text-3xl font-bold">
          Set Up Your Organization
        </h1>
        <p className="text-muted-foreground mt-2">
          Create a new organization or join an existing one to get started
        </p>
      </div>

      {/* Organization Setup Card */}
      <Card>
        <div className="from-primary/5 to-secondary/5 absolute inset-0 rounded-lg" />
        <CardHeader className="relative pb-6">
          <CardTitle className="text-foreground text-center text-2xl">
            Choose Your Setup
          </CardTitle>
          <CardDescription className="text-muted-foreground text-center">
            Select how you&apos;d like to proceed
          </CardDescription>
        </CardHeader>

        <CardContent className="relative">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {/* Action Selection */}
              <FormField
                control={form.control}
                name="action"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedAction(value as "create" | "join");
                        }}
                        className="grid gap-4 md:grid-cols-2"
                      >
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Label
                            htmlFor="create"
                            className="border-input hover:border-primary flex cursor-pointer items-center space-x-3 rounded-lg border p-4 transition-colors"
                          >
                            <RadioGroupItem value="create" id="create" />
                            <div className="flex items-center space-x-3">
                              <div className="bg-primary/10 text-primary rounded-full p-2">
                                <Plus className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="text-foreground font-medium">
                                  Create Organization
                                </div>
                                <div className="text-muted-foreground text-sm">
                                  Start fresh with a new organization
                                </div>
                              </div>
                            </div>
                          </Label>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Label
                            htmlFor="join"
                            className="border-input hover:border-primary flex cursor-pointer items-center space-x-3 rounded-lg border p-4 transition-colors"
                          >
                            <RadioGroupItem value="join" id="join" />
                            <div className="flex items-center space-x-3">
                              <div className="bg-secondary/10 text-secondary rounded-full p-2">
                                <UserPlus className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="text-foreground font-medium">
                                  Join Organization
                                </div>
                                <div className="text-muted-foreground text-sm">
                                  Join an existing organization
                                </div>
                              </div>
                            </div>
                          </Label>
                        </motion.div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Create Organization Form */}
              {selectedAction === "create" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="organizationData.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">
                          Organization Name
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Building2 className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                            <Input
                              type="text"
                              placeholder="Enter organization name"
                              className="bg-background focus:border-primary border pl-10"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                // Auto-generate slug
                                const slug = slugify(e.target.value, {
                                  lower: true,
                                });
                                form.setValue("organizationData.slug", slug);
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="organizationData.slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">
                          Organization Slug (URL)
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Users className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                            <Input
                              type="text"
                              placeholder="organization-slug"
                              className="bg-background focus:border-primary border pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <p className="text-muted-foreground text-xs">
                          This will be used in your organization&apos;s URL
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}

              {/* Join Organization Form */}
              {selectedAction === "join" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="joinData.inviteCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">
                          Invitation Code
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <UserPlus className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                            <Input
                              type="text"
                              placeholder="Enter invitation code"
                              className="bg-background focus:border-primary border pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <p className="text-muted-foreground text-xs">
                          Enter the invitation ID from your organization admin
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}

              {/* Submit Button */}
              {selectedAction && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 w-full"
                    disabled={createOrg.isPending || joinOrg.isPending}
                  >
                    {createOrg.isPending || joinOrg.isPending ? (
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>
                          {selectedAction === "create"
                            ? "Creating..."
                            : "Joining..."}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>
                          {selectedAction === "create"
                            ? "Create Organization"
                            : "Join Organization"}
                        </span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </motion.div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
