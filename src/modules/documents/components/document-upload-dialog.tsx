"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadTrigger,
  FileUploadList,
  FileUploadItem,
  FileUploadItemPreview,
  FileUploadItemMetadata,
  FileUploadItemProgress,
  FileUploadItemDelete,
} from "@/components/ui/file-upload";
import { createDocumentSchema } from "../schemas";
import { DOCUMENT_TYPES, VISIBILITY_LEVELS, FILE_UPLOAD } from "../consts";
import { uploadFileToS3 } from "@/lib/storage";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import { Spinner } from "@/components/spinner";
import type { CreateDocumentInput } from "../schemas";

interface DocumentUploadDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function DocumentUploadDialog({
  trigger,
  onSuccess,
}: DocumentUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);

  const utils = api.useUtils();
  const attachmentMutation = api.attachment.getPresignedUrl.useMutation();
  const createDocumentMutation = api.documents.create.useMutation();

  const form = useForm<CreateDocumentInput>({
    resolver: zodResolver(createDocumentSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "other",
      visibility: "employees",
      employeeId: undefined,
      attachmentId: undefined,
    },
  });

  const handleFileValidate = (file: File) => {
    if (file.size > FILE_UPLOAD.MAX_SIZE) {
      return `File size must be less than ${FILE_UPLOAD.MAX_SIZE / 1024 / 1024}MB`;
    }

    if (
      !FILE_UPLOAD.ALLOWED_TYPES.includes(
        file.type as (typeof FILE_UPLOAD.ALLOWED_TYPES)[number],
      )
    ) {
      return "File type not supported";
    }

    return null;
  };

  const handleFileAccept = (file: File) => {
    if (!form.getValues("title")) {
      const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
      form.setValue("title", nameWithoutExtension);
    }
  };

  const handleUpload = async (
    files: File[],
    options: {
      onProgress: (file: File, progress: number) => void;
      onSuccess: (file: File) => void;
      onError: (file: File, error: Error) => void;
    },
  ): Promise<void> => {
    if (files.length === 0) return;

    try {
      const file = files[0]!;

      // Get presigned URL
      const uploadResponse = await attachmentMutation.mutateAsync({
        fileName: file.name,
        mimeType: file.type,
        type: "document",
      });

      // Upload to S3 - simulate progress since actual progress isn't available
      options.onProgress(file, 0);

      await uploadFileToS3({
        file,
        presignedUrl: uploadResponse.uploadUrl,
      });

      form.setValue("attachmentId", uploadResponse.attachmentId);

      options.onProgress(file, 100);
      options.onSuccess(file);
    } catch (error) {
      console.error("Upload error:", error);
      const file = files[0]!;
      options.onError(file, new Error("Upload failed"));
      throw error;
    }
  };

  const onSubmit = async (data: CreateDocumentInput) => {
    if (uploadFiles.length === 0) {
      toast.error("Please select a file to upload");
      return;
    }

    // Check if the file URL has been set (meaning upload is complete)
    if (!data.attachmentId) {
      toast.error("Please wait for the file to finish uploading");
      return;
    }

    setIsUploading(true);
    try {
      // Create document record with the already uploaded file URL
      await createDocumentMutation.mutateAsync({
        title: data.title,
        description: data.description,
        type: data.type,
        visibility: data.visibility,
        attachmentId: data.attachmentId,
        employeeId: data.employeeId,
      });

      toast.success("Document uploaded successfully!");

      // Reset form and close dialog
      form.reset();
      setUploadFiles([]);
      setOpen(false);
      onSuccess?.();

      // Refresh documents list
      await utils.documents.list.invalidate();
      await utils.documents.getStats.invalidate();
    } catch (error) {
      console.error("Document creation error:", error);
      toast.error("Failed to create document. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] min-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a new document to share with your team. Choose the
            appropriate type and visibility level.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* File Upload Section */}
            <div className="space-y-4">
              <FormLabel>Document File *</FormLabel>
              <FileUpload
                value={uploadFiles}
                onValueChange={setUploadFiles}
                onFileAccept={handleFileAccept}
                onFileValidate={handleFileValidate}
                onUpload={handleUpload}
                accept={FILE_UPLOAD.ALLOWED_TYPES.join(",")}
                maxFiles={1}
                maxSize={FILE_UPLOAD.MAX_SIZE}
                disabled={isUploading}
              >
                <FileUploadDropzone className="border-muted-foreground/25 hover:border-muted-foreground/50 border-2 border-dashed">
                  <div className="text-center">
                    <Upload className="text-muted-foreground mx-auto h-12 w-12" />
                    <p className="text-muted-foreground mt-2 text-sm">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      PDF, DOC, DOCX, XLS, XLSX, TXT, CSV, Images up to{" "}
                      {FILE_UPLOAD.MAX_SIZE / 1024 / 1024}MB
                    </p>
                  </div>
                  <FileUploadTrigger asChild>
                    <Button variant="outline" disabled={isUploading}>
                      Browse Files
                    </Button>
                  </FileUploadTrigger>
                </FileUploadDropzone>

                <FileUploadList>
                  {uploadFiles.map((file) => (
                    <FileUploadItem key={file.name} value={file}>
                      <FileUploadItemPreview />
                      <FileUploadItemMetadata />
                      <FileUploadItemProgress />
                      <FileUploadItemDelete asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={isUploading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </FileUploadItemDelete>
                    </FileUploadItem>
                  ))}
                </FileUploadList>
              </FileUpload>
            </div>

            {/* Document Information */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter document title"
                        {...field}
                        disabled={isUploading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Type *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isUploading}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DOCUMENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what this document contains..."
                      rows={3}
                      {...field}
                      disabled={isUploading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibility *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isUploading}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select visibility level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {VISIBILITY_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isUploading || uploadFiles.length === 0 || !form.watch("attachmentId")
                }
              >
                {isUploading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Document
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
