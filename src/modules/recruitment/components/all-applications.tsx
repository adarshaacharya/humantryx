"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  FileText,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { AIResultsViewer } from "@/modules/recruitment/resume-screening/ai-results-viewer";

const STATUS_OPTIONS = [
  { value: "all", label: "All Applications" },
  { value: "applied", label: "Applied" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interviewed", label: "Interviewed" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Rejected" },
] as const;

const STATUS_COLORS = {
  applied: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  shortlisted:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  interviewed:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  hired: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export function AllApplications() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<
    "all" | "applied" | "shortlisted" | "interviewed" | "hired" | "rejected"
  >("all");
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const { data, isLoading } = api.recruitment.getAllApplications.useQuery({
    search: search || undefined,
    status,
    limit: pageSize,
    offset: page * pageSize,
  });

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
        <p className="text-muted-foreground mt-2">
          View and manage all job applications across your organization
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Applications
            </CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                (data?.total ?? 0)
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search by candidate name or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                className="pl-10"
              />
            </div>
            <Select
              value={status}
              onValueChange={(value: typeof status) => {
                setStatus(value);
                setPage(0);
              }}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-4 p-8">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !data?.applications.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="text-lg font-semibold">No applications found</h3>
              <p className="text-muted-foreground text-sm">
                {search || status !== "all"
                  ? "Try adjusting your filters"
                  : "Applications will appear here once candidates apply"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Job Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>AI Score</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.applications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {application.candidateName}
                          </div>
                          <div className="text-muted-foreground flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3" />
                            {application.candidateEmail}
                          </div>
                          {application.candidatePhone && (
                            <div className="text-muted-foreground flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3" />
                              {application.candidatePhone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {application.jobPosting ? (
                          <div className="space-y-1">
                            <Link
                              href={`/dashboard/recruitment/jobs/${application.jobPosting.id}`}
                              className="font-medium hover:underline"
                            >
                              {application.jobPosting.title}
                            </Link>
                            <div className="text-muted-foreground flex items-center gap-2 text-sm">
                              <Briefcase className="h-3 w-3" />
                              {application.jobPosting.department}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            N/A
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            STATUS_COLORS[
                              application.status as keyof typeof STATUS_COLORS
                            ]
                          }
                        >
                          {application.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {application.aiScreeningResult ? (
                          <AIResultsViewer
                            results={{
                              matchScore:
                                application.aiScreeningResult.matchScore,
                              confidence:
                                application.aiScreeningResult.confidence,
                              recommendation:
                                application.aiScreeningResult.recommendation,
                              matchedSkills:
                                application.aiScreeningResult.matchedSkills,
                              missingSkills:
                                application.aiScreeningResult.missingSkills,
                              reasoning: application.aiScreeningResult.summary,
                            }}
                          />
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Not screened
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-muted-foreground flex items-center gap-2 text-sm">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(
                            new Date(application.appliedAt),
                            { addSuffix: true },
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {application.resumeUrl && (
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={application.resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2"
                              >
                                Resume
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            Showing {page * pageSize + 1} to{" "}
            {Math.min((page + 1) * pageSize, data.total)} of {data.total}{" "}
            applications
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages - 1}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
