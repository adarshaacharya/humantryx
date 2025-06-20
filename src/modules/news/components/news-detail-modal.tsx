"use client";

import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, User, Share2, Clock, Edit, Trash2 } from "lucide-react";
import type { NewsWithAuthor } from "../types";

interface NewsDetailModalProps {
  article: NewsWithAuthor | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (article: NewsWithAuthor) => void;
  onDelete?: (article: NewsWithAuthor) => void;
  currentUserId?: string;
}

export function NewsDetailModal({
  article,
  isOpen,
  onOpenChange,
  onEdit,
  onDelete,
  currentUserId,
}: NewsDetailModalProps) {
  if (!article) return null;

  const authorUser = (
    article.author as { user?: { id: string; name: string; email: string } }
  )?.user;
  const isAuthor = authorUser?.id === currentUserId;
  const authorName = authorUser?.name || "Anonymous User";

  const authorInitials = authorName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: article.title,
        text: article.content.substring(0, 200) + "...",
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(
        `${article.title}\n\n${article.content.substring(0, 200)}...\n\n${window.location.href}`,
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] min-w-4xl flex-col overflow-hidden">
        <DialogHeader className="space-y-4">
          {/* Article Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <DialogTitle className="flex-1 text-2xl leading-tight font-bold">
                {article.title}
              </DialogTitle>

              {/* Action Buttons */}
              <div className="flex flex-shrink-0 items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>

                {isAuthor && onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onEdit(article);
                      onOpenChange(false);
                    }}
                    className="gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                )}

                {isAuthor && onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onDelete(article);
                      onOpenChange(false);
                    }}
                    className="text-destructive hover:text-destructive gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                )}
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={article.isActive ? "default" : "secondary"}>
                {article.isActive ? "Published" : "Inactive"}
              </Badge>
            </div>

            {/* Content Preview */}
            <p className="text-muted-foreground text-lg leading-relaxed">
              {article.content.length > 200
                ? article.content.substring(0, 200) + "..."
                : article.content}
            </p>
          </div>
        </DialogHeader>

        {/* Author and Meta Info */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Avatar className="ring-primary/10 h-12 w-12 ring-2">
              <AvatarFallback className="from-primary/20 to-primary/10 text-primary bg-gradient-to-br font-bold">
                {authorInitials}
              </AvatarFallback>
            </Avatar>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{authorName}</span>
                <Badge variant="secondary" className="text-xs">
                  {article.author?.designation
                    ?.replace(/_/g, " ")
                    .toUpperCase() || "EMPLOYEE"}
                </Badge>
              </div>

              <div className="text-muted-foreground flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {formatDistanceToNow(new Date(article.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    {Math.ceil(article.content.split(" ").length / 200)} min
                    read
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Article Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                {article.content}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t pt-4">
          <div className="text-muted-foreground flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Published by {authorName}</span>
            </div>

            {article.updatedAt !== article.createdAt && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>
                  Updated{" "}
                  {formatDistanceToNow(new Date(article.updatedAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
