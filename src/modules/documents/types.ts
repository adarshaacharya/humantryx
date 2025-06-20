import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/api/root";
import type {
  CreateDocumentInput,
  UpdateDocumentInput,
  DocumentFilters,
  DocumentPagination,
} from "./schemas";

type RouterOutputs = inferRouterOutputs<AppRouter>;

// Document types from API
export type Document = RouterOutputs["documents"]["list"]["documents"][0];
export type DocumentStats = RouterOutputs["documents"]["getStats"];

// Re-export schema types
export type {
  CreateDocumentInput,
  UpdateDocumentInput,
  DocumentFilters,
  DocumentPagination,
};

// UI state types
export type DocumentViewMode = "cards" | "list";

export type DocumentAction = "view" | "edit" | "delete" | "download";
