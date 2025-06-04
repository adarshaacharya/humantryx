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

const inviteMemberSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["member", "admin"], {
    required_error: "Please select a role",
  }),
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

  const form = useForm<InviteMemberSchemaType>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      role: "member", // Set default role
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
        toast.success("Invitation sent successfully!");

        // Invalidate organization queries to refresh member lists
        await utils.organization.getOverview.invalidate();
        // await utils.organization.getCurrent.invalidate();

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
              className="space-y-4"
            >
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

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Sending...</span>
                    </div>
                  ) : (
                    "Send Invitation"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
