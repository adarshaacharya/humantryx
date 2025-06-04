"use client";

import { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { columns } from "./user-columns";
import { DataTable } from "@/components/ui/data-table/data-table";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface UsersTableProps {
  limit?: number;
}

const banUserSchema = z.object({
  reason: z.string().min(1, "Ban reason is required"),
  expiresIn: z.number().min(0).optional(),
});

export function UsersTable({ limit }: UsersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const utils = api.useUtils();
  const listUsersQuery = api.admin.listUsers.useQuery({
    limit: limit ?? 10,
    offset: 0,
    searchQuery,
    sortBy: "createdAt",
    sortDirection: "desc",
  });

  const updateRoleMutation = api.admin.updateUserRole.useMutation({
    onSuccess: () => {
      void utils.admin.listUsers.invalidate();
      toast.success("User role updated successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const banUserMutation = api.admin.banUser.useMutation({
    onSuccess: () => {
      void utils.admin.listUsers.invalidate();
      toast.success("User banned successfully");
      setBanDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const unbanUserMutation = api.admin.unbanUser.useMutation({
    onSuccess: () => {
      void utils.admin.listUsers.invalidate();
      toast.success("User unbanned successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const form = useForm<z.infer<typeof banUserSchema>>({
    resolver: zodResolver(banUserSchema),
    defaultValues: {
      reason: "",
      expiresIn: undefined,
    },
  });

  const handleUpdateRole = useCallback(
    async (id: string, role: "super_admin" | "user") => {
      updateRoleMutation.mutate({ userId: id, role });
    },
    [updateRoleMutation],
  );

  const handleBanUser = useCallback(async (id: string) => {
    setSelectedUserId(id);
    setBanDialogOpen(true);
  }, []);

  const handleUnbanUser = useCallback(
    async (id: string) => {
      unbanUserMutation.mutate({ userId: id });
    },
    [unbanUserMutation],
  );

  const onBanSubmit = useCallback(
    (values: z.infer<typeof banUserSchema>) => {
      if (!selectedUserId) return;

      banUserMutation.mutate({
        userId: selectedUserId,
        banReason: values.reason,
        banExpiresIn: values.expiresIn,
      });
    },
    [selectedUserId, banUserMutation],
  );

  if (listUsersQuery.error) {
    return (
      <div className="border-destructive/50 bg-destructive/10 rounded-lg border p-4">
        <div className="flex flex-col space-y-2">
          <p className="text-destructive text-sm font-medium">
            Error loading users
          </p>
          <p className="text-destructive text-xs">
            {listUsersQuery.error.message}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => listUsersQuery.refetch()}
            className="text-destructive w-fit"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Input
            placeholder="Filter users..."
            className="max-w-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => listUsersQuery.refetch()}
            className="ml-2"
            disabled={listUsersQuery.isLoading}
          >
            <RefreshCw
              className={cn(
                "h-4 w-4",
                listUsersQuery.isLoading && "animate-spin",
              )}
            />
            <span className="sr-only ml-2">Refresh</span>
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={listUsersQuery.data?.users ?? []}
          meta={{
            updateRole: handleUpdateRole,
            banUser: handleBanUser,
            unbanUser: handleUnbanUser,
            isUpdating: updateRoleMutation.isPending,
            isBanning: banUserMutation.isPending,
            isUnbanning: unbanUserMutation.isPending,
            pendingActionId:
              updateRoleMutation.variables?.userId ??
              banUserMutation.variables?.userId ??
              unbanUserMutation.variables?.userId,
          }}
        />
      </div>

      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Enter a reason for banning this user. You can optionally set an
              expiration time for the ban.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onBanSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter ban reason" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiresIn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ban Duration (seconds)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          )
                        }
                        placeholder="Leave empty for permanent ban"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBanDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={banUserMutation.isPending}
                >
                  {banUserMutation.isPending ? "Banning..." : "Ban User"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
