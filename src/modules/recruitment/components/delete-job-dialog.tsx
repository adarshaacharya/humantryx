"use client";

import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface DeleteJobDialogProps {
  jobId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteJobDialog({
  jobId,
  open,
  onOpenChange,
}: DeleteJobDialogProps) {
  const utils = api.useUtils();

  const deleteJobMutation = api.recruitment.delete.useMutation({
    onSuccess: () => {
      toast.success("Job posting deleted successfully!");
      onOpenChange(false);
      void utils.recruitment.list.invalidate();
      void utils.recruitment.getStats.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete job posting");
    },
  });

  const handleDelete = () => {
    if (jobId) {
      deleteJobMutation.mutate({ id: jobId });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-destructive/10 flex h-10 w-10 items-center justify-center rounded-full">
              <AlertTriangle className="text-destructive h-5 w-5" />
            </div>
            <div>
              <DialogTitle>Delete Job Posting</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this job posting? This action
                cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="border-destructive/20 bg-destructive/5 rounded-lg border p-4">
          <h4 className="text-destructive mb-2 font-medium">
            This will permanently:
          </h4>
          <ul className="text-destructive/80 space-y-1 text-sm">
            <li>• Delete the job posting</li>
            <li>• Remove all associated applications</li>
            <li>• Remove all application data and notes</li>
          </ul>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteJobMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteJobMutation.isPending}
          >
            {deleteJobMutation.isPending ? "Deleting..." : "Delete Job"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
