"use client";

import { Button } from "@/components/ui/button";
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
import { Trash2, FileText, Calendar, User } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { DOCUMENT_TYPES, VISIBILITY_LEVELS } from "../consts";

interface Document {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  visibility: string;
  createdAt: Date;
  author?: {
    name?: string | null;
  } | null;
}

interface DocumentDeleteDialogProps {
  document: Document | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDocumentDeleted?: () => void;
}

export function DocumentDeleteDialog({
  document,
  isOpen,
  onOpenChange,
  onDocumentDeleted,
}: DocumentDeleteDialogProps) {
  const utils = api.useUtils();

  const deleteDocument = api.documents.delete.useMutation({
    onSuccess: () => {
      toast.success("Document deleted successfully!");
      void utils.documents.list.invalidate();
      void utils.documents.getStats.invalidate();
      onDocumentDeleted?.();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to delete document");
    },
  });

  const handleDelete = () => {
    if (!document) return;

    deleteDocument.mutate({
      id: document.id,
    });
  };

  if (!document) {
    return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="text-destructive h-5 w-5" />
            Delete Document
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                Are you sure you want to delete this document? This action
                cannot be undone and the document will be permanently removed.
              </p>

              <div className="bg-muted/50 rounded-lg border p-3">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <FileText className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <h4 className="line-clamp-2 font-medium">
                        {document.title}
                      </h4>
                      {document.description && (
                        <p className="text-muted-foreground line-clamp-2 text-sm">
                          {document.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {
                            DOCUMENT_TYPES.find(
                              (t) => t.value === document.type,
                            )?.label
                          }
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {
                            VISIBILITY_LEVELS.find(
                              (v) => v.value === document.visibility,
                            )?.label
                          }
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="text-muted-foreground flex items-center justify-between border-t pt-2 text-xs">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {document.author?.name ?? "Unknown"}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDistanceToNow(new Date(document.createdAt), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm font-medium text-amber-600">
                ⚠️ Warning: This document will be permanently deleted and cannot
                be recovered.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteDocument.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              disabled={deleteDocument.isPending}
              onClick={handleDelete}
            >
              {deleteDocument.isPending
                ? "Deleting..."
                : "Yes, delete document"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
