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
import { Trash2, Newspaper, Calendar } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { formatDistanceToNow } from "date-fns";
import type { NewsWithAuthor } from "../types";

interface NewsDeleteDialogProps {
  article: NewsWithAuthor | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onArticleDeleted?: () => void;
}

export function NewsDeleteDialog({
  article,
  isOpen,
  onOpenChange,
  onArticleDeleted,
}: NewsDeleteDialogProps) {
  const utils = api.useUtils();

  const deleteNews = api.news.deleteNews.useMutation({
    onSuccess: () => {
      toast.success("News article deleted successfully!");
      void utils.news.getNews.invalidate();
      onArticleDeleted?.();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to delete news article");
    },
  });

  const handleDelete = () => {
    if (!article) return;

    deleteNews.mutate({
      id: article.id,
    });
  };

  if (!article) {
    return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="text-destructive h-5 w-5" />
            Delete News Article
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                Are you sure you want to delete this news article? This action
                cannot be undone and the article will be permanently removed.
              </p>

              <div className="bg-muted/50 rounded-lg border p-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Newspaper className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0" />
                    <div className="flex-1 space-y-3">
                      <div>
                        <h4 className="line-clamp-2 text-base font-medium">
                          {article.title}
                        </h4>
                        <div className="text-muted-foreground mt-2 flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDistanceToNow(new Date(article.createdAt), {
                              addSuffix: true,
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/20">
                <div className="flex items-start gap-2">
                  <Trash2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800 dark:text-amber-200">
                      Permanent Deletion
                    </p>
                    <p className="mt-1 text-amber-700 dark:text-amber-300">
                      This news article will be permanently deleted and cannot
                      be recovered. All associated data including views and
                      engagement will be lost.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteNews.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              disabled={deleteNews.isPending}
              onClick={handleDelete}
            >
              {deleteNews.isPending ? "Deleting..." : "Yes, delete article"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
