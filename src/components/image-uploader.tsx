"use client";

import { generateR2Url, uploadFileToS3 } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { Camera, Upload, User, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Spinner } from "./spinner";
import { toast } from "sonner";

type ImageUploaderProps = {
  value?: string | null;
  onChange?: (path: string | null) => void;
  className?: string;
};

export function ImageUploader({
  value,
  onChange,
  className,
}: ImageUploaderProps) {
  const [currentImage, setCurrentImage] = useState<string | undefined>(
    value ?? undefined,
  );
  const [loading, setLoading] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const attachmentMutation = api.attachment.getPresignedUrl.useMutation();

  useEffect(() => {
    setCurrentImage(value ?? undefined);
  }, [value]);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setLoading(true);
    try {
      const response = await attachmentMutation.mutateAsync({
        fileName: file.name,
        mimeType: file.type,
        type : "image",
      });

      await uploadFileToS3({
        file: file,
        presignedUrl: response.uploadUrl,
      });

      setCurrentImage(response.publicUrl);
      onChange?.(response.publicUrl);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile) {
        await handleFileUpload(selectedFile);
      }
    }
  };

  const handleRemove = () => {
    setCurrentImage(undefined);
    onChange?.(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {currentImage ? (
        <div className="group relative">
          <Avatar className="mx-auto h-32 w-32 rounded-lg">
            <AvatarImage
              src={currentImage}
              className="h-full w-full object-cover"
            />
            <AvatarFallback className="bg-muted h-full w-full rounded-lg">
              <User className="text-muted-foreground h-12 w-12" />
            </AvatarFallback>
          </Avatar>

          {/* Overlay with actions */}
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => inputRef.current?.click()}
                disabled={loading}
                className="bg-white/90 text-black hover:bg-white"
              >
                <Camera className="mr-1 h-4 w-4" />
                Change
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleRemove}
                disabled={loading}
                className="bg-red-500/90 hover:bg-red-600"
              >
                <X className="mr-1 h-4 w-4" />
                Remove
              </Button>
            </div>
          </div>

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
              <div className="flex items-center gap-2 text-white">
                <Spinner className="h-5 w-5" />
                <span className="text-sm">Uploading...</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          {/* Avatar placeholder */}
          <Avatar className="border-muted-foreground/25 h-32 w-32 rounded-lg border-2 border-dashed">
            <AvatarFallback className="bg-muted h-full w-full rounded-lg">
              <User className="text-muted-foreground h-12 w-12" />
            </AvatarFallback>
          </Avatar>

          {/* Upload button */}
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="w-full max-w-xs"
          >
            {loading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Photo
              </>
            )}
          </Button>

          <p className="text-muted-foreground text-center text-xs">
            Max size: 5MB • PNG, JPG, GIF
          </p>
        </div>
      )}

      {/* Hidden file input */}
      <Input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
        accept="image/*"
        disabled={loading}
      />
    </div>
  );
}
