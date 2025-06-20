"use client";

import { useState } from "react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, FileText, X } from "lucide-react";
import { uploadFileToS3 } from "@/lib/storage";
import { toast } from "sonner";
import { Spinner } from "@/components/spinner";

const resumeUploadSchema = z.object({
  candidateName: z.string().min(1, "Candidate name is required"),
  candidateEmail: z.string().email("Valid email is required"),
  candidatePhone: z.string().optional(),
  coverLetter: z.string().optional(),
});

type ResumeUploadFormData = z.infer<typeof resumeUploadSchema>;

interface UploadResumeDialogProps {
  jobId: string;
  trigger?: React.ReactNode;
}

export function UploadResumeDialog({
  jobId,
  trigger,
}: UploadResumeDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const utils = api.useUtils();
  const attachmentMutation = api.attachment.getPresignedUrl.useMutation();
  const createApplicationMutation =
    api.recruitment.createApplication.useMutation();

  const form = useForm<ResumeUploadFormData>({
    resolver: zodResolver(resumeUploadSchema),
    defaultValues: {
      candidateName: "",
      candidateEmail: "",
      candidatePhone: "",
      coverLetter: "",
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type (PDF, DOC, DOCX)
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a PDF, DOC, or DOCX file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setSelectedFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const onSubmit = async (data: ResumeUploadFormData) => {
    if (!selectedFile) {
      toast.error("Please select a resume file");
      return;
    }

    setIsUploading(true);
    try {
      // Upload file to S3
      const uploadResponse = await attachmentMutation.mutateAsync({
        fileName: selectedFile.name,
        mimeType: selectedFile.type,
        type: "document",
      });

      await uploadFileToS3({
        file: selectedFile,
        presignedUrl: uploadResponse.uploadUrl,
      });

      // Create job application
      await createApplicationMutation.mutateAsync({
        jobPostingId: jobId,
        candidateName: data.candidateName,
        candidateEmail: data.candidateEmail,
        candidatePhone: data.candidatePhone || null,
        resumeUrl: uploadResponse.publicUrl,
        coverLetter: data.coverLetter || null,
      });

      toast.success("Resume uploaded and application created successfully!");

      // Reset form and close dialog
      form.reset();
      setSelectedFile(null);
      setOpen(false);

      // Refresh applications list
      await utils.recruitment.getApplications.invalidate({ jobId });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload resume. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} >
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Resume
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="min-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Candidate Resume</DialogTitle>
          <DialogDescription>
            Upload a candidate&apos;s resume and create their job application
            manually.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* File Upload Section */}
            <div className="space-y-4">
              <FormLabel>Resume File *</FormLabel>

              {!selectedFile ? (
                <div className="border-muted-foreground/25 hover:border-muted-foreground/50 relative cursor-pointer rounded-lg border-2 border-dashed p-6 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    disabled={isUploading}
                  />
                  <div className="text-center">
                    <Upload className="text-muted-foreground mx-auto h-12 w-12" />
                    <p className="text-muted-foreground mt-2 text-sm">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      PDF, DOC, DOCX up to 5MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-muted flex items-center gap-3 rounded-lg p-4">
                  <FileText className="text-primary h-8 w-8" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Candidate Information */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="candidateName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Candidate Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter candidate's full name"
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
                name="candidateEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="candidate@example.com"
                        {...field}
                        disabled={isUploading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="candidatePhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter phone number"
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
              name="coverLetter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Letter (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter cover letter or additional notes..."
                      rows={4}
                      {...field}
                      disabled={isUploading}
                    />
                  </FormControl>
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
              <Button type="submit" disabled={isUploading || !selectedFile}>
                {isUploading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload & Create Application
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
