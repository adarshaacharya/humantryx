"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface OrganizationStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  organizationName: string;
  newStatus: "active" | "suspended";
  isLoading?: boolean;
}

export function OrganizationStatusDialog({
  open,
  onOpenChange,
  onConfirm,
  organizationName,
  newStatus,
  isLoading,
}: OrganizationStatusDialogProps) {
  const action = newStatus === "suspended" ? "suspend" : "activate";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {action === "suspend"
              ? "Suspend Organization"
              : "Activate Organization"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to {action}{" "}
            <span className="font-medium">{organizationName}</span>?
            {action === "suspend" && (
              <p className="text-destructive mt-2">
                This will prevent all users from accessing the organization
                until it is reactivated.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className={
              action === "suspend"
                ? "bg-destructive hover:bg-destructive/90"
                : undefined
            }
          >
            {isLoading
              ? "Processing..."
              : action === "suspend"
                ? "Suspend"
                : "Activate"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
