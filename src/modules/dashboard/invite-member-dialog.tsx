"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Mail, Copy } from "lucide-react";
import { authClient } from "@/server/auth/auth-client";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "@/trpc/react";
import { env } from "@/env";

const inviteMemberSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["member", "admin"], {
    required_error: "Please select a role",
  }),
  name: z.string().min(2, "Name must be at least 2 characters"),
  designation: z.string().min(2, "Designation must be at least 2 characters"),
});

type InviteMemberSchemaType = z.infer<typeof inviteMemberSchema>;

interface InviteMemberDialogProps {
  onInviteSent?: () => void;
}

export function InviteMemberDialog({ onInviteSent }: InviteMemberDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [invitationId, setInvitationId] = useState<string | null>(null);

  // Use TRPC utils for cache invalidation
  const utils = api.useUtils();

  const createEmployee = api.employee.create.useMutation({
    onError: (error) => {
      console.error("Failed to create employee:", error);
      toast.error("Failed to create employee record");
    },
    onSuccess: async () => {
      toast.success("Employee record created successfully!");
      await utils.organization.getOverview.invalidate();
    },
  });

  const form = useForm<InviteMemberSchemaType>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      role: "member",
      name: "",
      designation: "",
    },
  });

  const handleSubmit = async (values: InviteMemberSchemaType) => {
    setIsLoading(true);

    try {
      const { data, error } = await authClient.organization.inviteMember({
        email: values.email,
        role: values.role,
      });

      if (error) {
        toast.error(error.message ?? "Failed to send invitation");
        return;
      }

      if (data) {
        setInvitationId(data.id);

        // Create employee record using TRPC with just the basic info
        // The userId and memberId will be updated when the invitation is accepted
        await createEmployee.mutateAsync({
          organizationId: data.organizationId,
          name: values.name,
          designation: values.designation,
          invitationId: data.id, // Link to the invitation
        });

        // if (emailError) {
        //   console.error("Failed to send invitation email:", emailError);
        //   toast.error("Failed to send invitation email");
        // } else {
        //   toast.success("Invitation sent successfully!");
        // }

        // Invalidate organization queries to refresh member lists
        await utils.organization.getOverview.invalidate();

        onInviteSent?.();
        form.reset();
      }
    } catch (err) {
      console.error("Invitation error:", err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyInvitationId = async () => {
    if (invitationId) {
      await navigator.clipboard.writeText(invitationId);
      toast.success("Invitation ID copied to clipboard!");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setInvitationId(null);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Send an invitation to join your organization
          </DialogDescription>
        </DialogHeader>

        {invitationId ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Invitation sent successfully!
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Share this invitation ID with the person you invited:
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Invitation ID</label>
              <div className="flex space-x-2">
                <Input
                  value={invitationId}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-900"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyInvitationId}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                The invited person should use this ID when joining the
                organization
              </p>
            </div>

            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="w-full space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter member's full name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter member's email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Designation</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter member's job title"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Invitation"}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
