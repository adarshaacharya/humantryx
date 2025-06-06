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
import { UserPlus, Mail, Copy } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { authClient } from "@/server/auth/auth-client";
import {
  inviteEmployeeSchema,
  type InviteEmployeeSchemaType,
} from "../schemas/employee.schema";

interface EmployeeInviteDialogProps {
  onInviteSent?: () => void;
  triggerButton?: React.ReactNode;
}

export function EmployeeInviteDialog({
  onInviteSent,
  triggerButton,
}: EmployeeInviteDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const utils = api.useUtils();
  const { data: session } = authClient.useSession();
  const organizationId = session?.session?.activeOrganizationId;

  const inviteEmployeeMutation = api.employee.invite.useMutation({
    onSuccess: (data) => {
      toast.success("Employee invitation sent successfully!");
      void utils.employee.list.invalidate();
      onInviteSent?.();
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to send invitation");
    },
  });

  const form = useForm<InviteEmployeeSchemaType>({
    resolver: zodResolver(inviteEmployeeSchema),
    defaultValues: {
      email: "",
      name: "",
      designation: "",
      organizationId: organizationId ?? "",
      
    },
  });

  const handleSubmit = async (values: InviteEmployeeSchemaType) => {
    if (!organizationId) {
      toast.error("No organization selected");
      return;
    }

    inviteEmployeeMutation.mutate({
      ...values,
      organizationId,
    });
  };

  const copyInvitationId = async () => {
    if (inviteEmployeeMutation.data?.invitation?.id) {
      await navigator.clipboard.writeText(
        inviteEmployeeMutation.data.invitation.id,
      );
      toast.success("Invitation ID copied to clipboard!");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerButton ?? (
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Employee
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Employee</DialogTitle>
          <DialogDescription>
            Send an invitation to join your organization as an employee
          </DialogDescription>
        </DialogHeader>

        {inviteEmployeeMutation.isSuccess ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Invitation sent successfully!
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    The employee will receive an email with instructions.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Invitation ID</label>
              <div className="flex space-x-2">
                <Input
                  value={inviteEmployeeMutation.data?.invitation?.id ?? ""}
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
                Share this ID with the employee to complete their registration
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
                        placeholder="Enter employee's full name"
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
                        placeholder="Enter employee's email"
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
                        placeholder="Enter employee's job title"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={inviteEmployeeMutation.isPending}
              >
                {inviteEmployeeMutation.isPending
                  ? "Sending..."
                  : "Send Invitation"}
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
