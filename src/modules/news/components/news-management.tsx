"use client";

import { useState, useCallback } from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { NewsCard } from "./news-card";
import { NewsDialog } from "./news-dialog";
import { NewsForm } from "./news-form";
import { Card, CardContent } from "@/components/ui/card";
import { Newspaper, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentEmployee } from "@/hooks/use-current-employee";
import type { CreateNewsForm, UpdateNewsForm } from "../schemas";
import type { NewsWithAuthor } from "../types";

export function NewsManagement() {
  const [editingArticle, setEditingArticle] = useState<NewsWithAuthor | null>(
    null,
  );

  const currentEmployee = useCurrentEmployee();
  const utils = api.useUtils();

  const newsQuery = api.news.getNews.useQuery();

  const createNewsMutation = api.news.createNews.useMutation({
    onSuccess: async () => {
      await utils.news.getNews.invalidate();
      toast.success("News article published successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to publish news article");
    },
  });

  const updateNewsMutation = api.news.updateNews.useMutation({
    onSuccess: async () => {
      await utils.news.getNews.invalidate();
      setEditingArticle(null);
      toast.success("News article updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update news article");
    },
  });

  const deleteNewsMutation = api.news.deleteNews.useMutation({
    onSuccess: async () => {
      await utils.news.getNews.invalidate();
      toast.success("News article deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete news article");
    },
  });

  // Handlers
  const handleCreateNews = useCallback(
    async (data: CreateNewsForm) => {
      await createNewsMutation.mutateAsync(data);
    },
    [createNewsMutation],
  );

  const handleFormSubmit = useCallback(
    async (data: CreateNewsForm | UpdateNewsForm) => {
      if ("id" in data) {
        // Update news
        await updateNewsMutation.mutateAsync(data);
      } else {
        // Create news
        await createNewsMutation.mutateAsync(data);
      }
    },
    [createNewsMutation, updateNewsMutation],
  );

  const handleEditNews = useCallback((article: NewsWithAuthor) => {
    setEditingArticle(article);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingArticle(null);
  }, []);

  const handleDeleteNews = useCallback(
    async (articleId: string) => {
      if (
        window.confirm("Are you sure you want to delete this news article?")
      ) {
        await deleteNewsMutation.mutateAsync({ id: articleId });
      }
    },
    [deleteNewsMutation],
  );

  const handleRefresh = useCallback(() => {
    void newsQuery.refetch();
  }, [newsQuery]);

  const newsArticles = newsQuery.data || [];
  const isLoading = newsQuery.isLoading;
  const isSubmitting =
    createNewsMutation.status === "pending" ||
    updateNewsMutation.status === "pending";
  const isDeleting = deleteNewsMutation.status === "pending";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-lg p-2">
              <Newspaper className="text-primary h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Company News
              </h1>
              <p className="text-muted-foreground text-sm">
                Stay updated with the latest announcements and updates
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <NewsDialog
            onSubmit={handleCreateNews}
            isSubmitting={createNewsMutation.status === "pending"}
          />
        </div>
      </div>

      {/* Edit Form (only show when editing) */}
      {editingArticle && (
        <div className="bg-muted/30 rounded-lg border border-dashed p-4">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <Sparkles className="text-primary h-4 w-4" />
            Edit News Article
          </h2>
          <NewsForm
            onSubmit={handleFormSubmit}
            onCancel={handleCancelEdit}
            editingArticle={editingArticle}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* News List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Latest News</h2>
          <div className="text-muted-foreground text-sm">
            {newsArticles.length}{" "}
            {newsArticles.length === 1 ? "article" : "articles"}
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-muted h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="bg-muted h-4 w-3/4 rounded" />
                      <div className="bg-muted h-3 w-1/2 rounded" />
                      <div className="bg-muted h-3 w-1/4 rounded" />
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="bg-muted h-3 rounded" />
                    <div className="bg-muted h-3 w-5/6 rounded" />
                    <div className="bg-muted h-3 w-4/6 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : newsArticles.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-muted/50 mb-3 rounded-full p-3">
                <Newspaper className="text-muted-foreground h-8 w-8" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">No news yet</h3>
              <p className="text-muted-foreground mb-4 max-w-md text-sm">
                Be the first to share company news, updates, or important
                announcements with your team.
              </p>
              <NewsDialog
                onSubmit={handleCreateNews}
                isSubmitting={createNewsMutation.status === "pending"}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {newsArticles.map((article) => (
              <NewsCard
                key={article.id}
                article={article}
                onEdit={handleEditNews}
                onDelete={handleDeleteNews}
                currentUserId={currentEmployee?.user?.id}
                isDeleting={isDeleting}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
