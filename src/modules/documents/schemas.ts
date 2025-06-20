import { z } from "zod";
import { FILE_UPLOAD } from "./consts";
import {
  documentTypeEnum,
  documentVisibilityEnum,
} from "@/server/db/documents";

// Base document schema for creation
export const createDocumentSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1000, "Description too long"),
  type: z.enum(documentTypeEnum.enumValues, {
    errorMap: () => ({ message: "Invalid document type" }),
  }),
  visibility: z.enum(documentVisibilityEnum.enumValues, {
    errorMap: () => ({ message: "Invalid visibility level" }),
  }),
  employeeId: z.string().uuid().optional(),
  attachmentId: z.string().uuid(),
});

// Update document schema
export const updateDocumentSchema = z.object({
  id: z.string().uuid(),
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title too long")
    .optional(),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1000, "Description too long")
    .optional(),
  type: z
    .enum(documentTypeEnum.enumValues, {
      errorMap: () => ({ message: "Invalid document type" }),
    })
    .optional(),
  visibility: z
    .enum(documentVisibilityEnum.enumValues, {
      errorMap: () => ({ message: "Invalid visibility level" }),
    })
    .optional(),
  employeeId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
  attachmentId: z.string().uuid().optional(),
});

// Document filters schema
export const documentFiltersSchema = z.object({
  type: z
    .enum(documentTypeEnum.enumValues, {
      errorMap: () => ({ message: "Invalid document type" }),
    })
    .optional(),
  visibility: z
    .enum(documentVisibilityEnum.enumValues, {
      errorMap: () => ({ message: "Invalid visibility level" }),
    })
    .optional(),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  uploadedBy: z.string().uuid().optional(),
  employeeId: z.string().uuid().optional(),
});

// Pagination schema
export const documentPaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z
    .enum(["title", "type", "createdAt", "updatedAt"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// File upload validation schema
export const fileUploadSchema = z
  .object({
    file: z.instanceof(File, { message: "Please select a file" }),
  })
  .refine((data) => data.file.size <= FILE_UPLOAD.MAX_SIZE, {
    message: `File size must be less than ${FILE_UPLOAD.MAX_SIZE / 1024 / 1024}MB`,
    path: ["file"],
  })
  .refine(
    (data) =>
      FILE_UPLOAD.ALLOWED_TYPES.includes(
        data.file.type as (typeof FILE_UPLOAD.ALLOWED_TYPES)[number],
      ),
    {
      message: "File type not supported",
      path: ["file"],
    },
  );

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type DocumentFilters = z.infer<typeof documentFiltersSchema>;
export type DocumentPagination = z.infer<typeof documentPaginationSchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
