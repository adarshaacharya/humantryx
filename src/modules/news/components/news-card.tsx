"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, MoreVertical, Calendar, Eye } from "lucide-react";
import type { NewsWithAuthor } from "../types";

interface NewsCardProps {
  article: NewsWithAuthor;
  onEdit: (article: NewsWithAuthor) => void;
  onDelete: (article: NewsWithAuthor) => void;
  onView?: (article: NewsWithAuthor) => void;
  currentUserId?: string;
  isDeleting?: boolean;
}

export function NewsCard({
  article,
  onEdit,
  onDelete,
  onView,
  currentUserId,
  isDeleting = false,
}: NewsCardProps) {
  const [showFullContent, setShowFullContent] = useState(false);

  // Handle both the actual user relation and fallback to author fields
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

  const truncatedContent =
    article.content.length > 200
      ? article.content.substring(0, 200) + "..."
      : article.content;

  const displayContent = showFullContent ? article.content : truncatedContent;
  const shouldShowReadMore = article.content.length > 200;

  return (
    <Card className="group hover:shadow-primary/5 border-l-primary/20 hover:border-l-primary/40 border-l-4 transition-all duration-200 hover:shadow-md">
      <CardContent className="p-4">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex flex-1 items-start gap-3">
            <Avatar className="ring-primary/10 h-10 w-10 ring-2">
              <AvatarFallback className="from-primary/20 to-primary/10 text-primary bg-gradient-to-br text-sm font-bold">
                {authorInitials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <h3 className="text-foreground group-hover:text-primary/90 mb-1 line-clamp-2 text-base font-bold transition-colors">
                {article.title}
              </h3>

              <div className="mb-1 flex items-center gap-2">
                <span className="text-foreground text-sm font-medium">
                  {authorName}
                </span>
                <Badge variant="secondary" className="px-2 py-0.5 text-xs">
                  {article.author?.designation
                    ?.replace(/_/g, " ")
                    .toUpperCase() || "EMPLOYEE"}
                </Badge>
              </div>

              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                <Calendar className="h-3 w-3" />
                <span>
                  {formatDistanceToNow(new Date(article.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </div>

          {isAuthor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-50 transition-opacity group-hover:opacity-100"
                  disabled={isDeleting}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(article)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(article)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <div className="prose prose-sm text-muted-foreground max-w-none leading-relaxed">
            <p className="mb-0 text-sm whitespace-pre-wrap">{displayContent}</p>
          </div>

          {shouldShowReadMore && (
            <div className="flex items-center gap-2">
              <Button
                variant="link"
                size="sm"
                onClick={() => setShowFullContent(!showFullContent)}
                className="text-primary hover:text-primary/80 h-auto p-0 text-sm"
              >
                {showFullContent ? "Show less" : "Read more"}
              </Button>

              {onView && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(article)}
                  className="h-auto gap-1 px-3 py-1 text-xs"
                >
                  <Eye className="h-3 w-3" />
                  View Details
                </Button>
              )}
            </div>
          )}

          {!shouldShowReadMore && onView && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(article)}
              className="mt-2 h-auto gap-1 px-3 py-1 text-xs"
            >
              <Eye className="h-3 w-3" />
              View Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
