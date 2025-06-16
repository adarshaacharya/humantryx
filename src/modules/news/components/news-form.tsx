"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Edit, X } from "lucide-react";
import { createNewsSchema, updateNewsSchema } from "../schemas";
import type { CreateNewsForm, UpdateNewsForm } from "../schemas";
import type { NewsWithAuthor } from "../types";

interface NewsFormProps {
  onSubmit: (data: CreateNewsForm | UpdateNewsForm) => Promise<void>;
  onCancel?: () => void;
  editingArticle?: NewsWithAuthor | null;
  isSubmitting?: boolean;
}

export function NewsForm({
  onSubmit,
  onCancel,
  editingArticle,
  isSubmitting = false,
}: NewsFormProps) {
  const isEditing = !!editingArticle;

  const createForm = useForm<CreateNewsForm>({
    resolver: zodResolver(createNewsSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const updateForm = useForm<UpdateNewsForm>({
    resolver: zodResolver(updateNewsSchema),
    defaultValues: editingArticle
      ? {
          id: editingArticle.id,
          title: editingArticle.title,
          content: editingArticle.content,
        }
      : undefined,
  });

  const handleCreateSubmit = async (data: CreateNewsForm) => {
    await onSubmit(data);
    createForm.reset();
  };

  const handleUpdateSubmit = async (data: UpdateNewsForm) => {
    await onSubmit(data);
  };

  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit News Article
            </CardTitle>
            {onCancel && (
              <Button variant="ghost" size="sm" onClick={onCancel}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <Form {...updateForm}>
            <form
              onSubmit={updateForm.handleSubmit(handleUpdateSubmit)}
              className="space-y-4"
            >
              <FormField
                control={updateForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter news title..."
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={updateForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your news, updates, or announcements..."
                        className="min-h-[120px] resize-none"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Updating..." : "Update"}
                </Button>
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5" />
          Share News
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...createForm}>
          <form
            onSubmit={createForm.handleSubmit(handleCreateSubmit)}
            className="space-y-4"
          >
            <FormField
              control={createForm.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter news title..."
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={createForm.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your news, updates, or announcements..."
                      className="min-h-[120px] resize-none"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Publishing..." : "Publish"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
