"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Upload,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  FileIcon,
  Calendar,
  User,
} from "lucide-react";
import { DocumentUploadDialog } from "./document-upload-dialog";
import { DocumentDeleteDialog } from "./document-delete-dialog";
import { DOCUMENT_TYPES, VISIBILITY_LEVELS } from "../consts";
import type { DocumentFilters } from "../types";
import { formatDistanceToNow } from "date-fns";
import { Can } from "@/components/can";
import { Skeleton } from "@/components/ui/skeleton";
import { getFileAbsoluteURI } from "@/lib/r2-absolute-uri";

const DEFAULT_FILTERS: DocumentFilters = {
  search: "",
  type: undefined,
  visibility: undefined,
  isActive: true,
};

export function DocumentsPage() {
  const [filters, setFilters] = useState<DocumentFilters>(DEFAULT_FILTERS);
  const [documentToDelete, setDocumentToDelete] = useState<
    (typeof documents)[0] | null
  >(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const documentsQuery = api.documents.list.useQuery({
    ...filters,
  });

  const statsQuery = api.documents.getStats.useQuery();

  const documents = documentsQuery.data?.documents ?? [];
  const stats = statsQuery.data;

  const handleFilterChange = (
    key: keyof DocumentFilters,
    value: string | boolean | undefined,
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = (search: string) => {
    handleFilterChange("search", search);
  };

  const handleDelete = (document: (typeof documents)[0]) => {
    setDocumentToDelete(document);
    setIsDeleteDialogOpen(true);
  };

  const handleDownload = (url: string, title: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = title;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Manage and access company documents, policies, and resources.
          </p>
        </div>

        <Can I="create" a="Documents">
          <DocumentUploadDialog
            onSuccess={async () => {
              await documentsQuery.refetch();
              await statsQuery.refetch();
            }}
          />
        </Can>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Documents
              </CardTitle>
              <FileText className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-muted-foreground text-xs">Active documents</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Recent Uploads
              </CardTitle>
              <Upload className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.recentUploads}
              </div>
              <p className="text-muted-foreground text-xs">Last 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Most Common</CardTitle>
              <FileIcon className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.byType.length > 0
                  ? stats.byType
                      .reduce((prev, current) =>
                        prev.count > current.count ? prev : current,
                      )
                      .type.charAt(0)
                      .toUpperCase() +
                    stats.byType
                      .reduce((prev, current) =>
                        prev.count > current.count ? prev : current,
                      )
                      .type.slice(1)
                  : "N/A"}
              </div>
              <p className="text-muted-foreground text-xs">Document type</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Policies</CardTitle>
              <FileText className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.byType.find((t) => t.type === "policy")?.count ?? 0}
              </div>
              <p className="text-muted-foreground text-xs">Company policies</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search documents..."
                value={filters.search ?? ""}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select
              value={filters.type ?? ""}
              onValueChange={(value) =>
                handleFilterChange("type", value || undefined)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.visibility ?? ""}
              onValueChange={(value) =>
                handleFilterChange("visibility", value || undefined)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All visibility</SelectItem>
                {VISIBILITY_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setFilters(DEFAULT_FILTERS);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {documentsQuery.isLoading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))
        ) : documents.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <FileText className="text-muted-foreground h-12 w-12" />
              <h3 className="mt-4 text-lg font-semibold">No documents found</h3>
              <p className="text-muted-foreground mt-2 text-sm">
                {filters.search || filters.type || filters.visibility
                  ? "Try adjusting your filters to see more results."
                  : "No documents have been uploaded yet."}
              </p>
            </CardContent>
          </Card>
        ) : (
          documents.map((document) => (
            <Card
              key={document.id}
              className="group transition-shadow hover:shadow-md"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-2 text-lg">
                      {document.title}
                    </CardTitle>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="secondary">
                        {
                          DOCUMENT_TYPES.find((t) => t.value === document.type)
                            ?.label
                        }
                      </Badge>
                      <Badge variant="outline">
                        {
                          VISIBILITY_LEVELS.find(
                            (v) => v.value === document.visibility,
                          )?.label
                        }
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-muted-foreground mb-4 line-clamp-3 text-sm">
                  {document.description}
                </p>

                <div className="text-muted-foreground mb-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {document.author?.name ?? "Unknown"}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDistanceToNow(new Date(document.createdAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      window.open(
                        getFileAbsoluteURI(document.attachment?.fullPath),
                        "_blank",
                      )
                    }
                    className="flex-1"
                  >
                    <Eye className="mr-1 h-4 w-4" />
                    View
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleDownload(
                        getFileAbsoluteURI(document.attachment?.fullPath),
                        document.title,
                      )
                    }
                  >
                    <Download className="h-4 w-4" />
                  </Button>

                  <Can I="delete" a="Documents">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(document)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </Can>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Dialog */}
      <DocumentDeleteDialog
        document={documentToDelete}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDocumentDeleted={() => {
          void documentsQuery.refetch();
          void statsQuery.refetch();
        }}
      />
    </div>
  );
}
