"use client";

import { useMemo } from "react";
import { api } from "@/trpc/react";
import { useDebounce } from "@/hooks/use-debounce";

export type SearchResultType =
  | "employee"
  | "document"
  | "job"
  | "leave"
  | "payroll";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  href: string;
  metadata?: any;
}

export function useCommandPaletteSearch(query: string) {
  const debouncedQuery = useDebounce(query, 300);
  const isSearching = debouncedQuery.length > 0;

  // Search employees
  const { data: employees, isLoading: isLoadingEmployees } =
    api.employee.list.useQuery(
      {
        searchQuery: debouncedQuery,
        limit: 5,
      },
      {
        enabled: isSearching,
      },
    );

  // Search documents
  const { data: documents, isLoading: isLoadingDocuments } =
    api.documents.list.useQuery(
      {
        search: debouncedQuery,
      },
      {
        enabled: isSearching,
      },
    );

  // Search job postings
  const { data: jobs, isLoading: isLoadingJobs } =
    api.recruitment.list.useQuery(
      {
        search: debouncedQuery,
        limit: 5,
        offset: 0,
      },
      {
        enabled: isSearching,
      },
    );

  // Search leave requests - note: leave API doesn't support search, so we skip it when searching
  const { data: leaves, isLoading: isLoadingLeaves } = api.leave.list.useQuery(
    {
      limit: 5,
      page: 1,
    },
    {
      enabled: false, // Disabled since leave API doesn't support search
    },
  );

  const isLoading =
    isLoadingEmployees ||
    isLoadingDocuments ||
    isLoadingJobs ||
    isLoadingLeaves;

  const results = useMemo(() => {
    const searchResults: SearchResult[] = [];

    // Add employee results
    if (employees?.employees) {
      employees.employees.forEach((emp) => {
        const userName = emp.user?.name ?? "Unknown User";
        const designation = emp.designation ?? "Employee";
        const department = emp.department ?? "No department";

        searchResults.push({
          id: emp.id,
          type: "employee",
          title: userName,
          subtitle: `${designation} • ${department}`,
          href: `/dashboard/employees/${emp.id}`,
          metadata: emp,
        });
      });
    }

    // Add document results
    if (documents?.documents) {
      documents.documents.forEach((doc) => {
        searchResults.push({
          id: doc.id,
          type: "document",
          title: doc.title,
          subtitle: `${doc.type} • ${doc.visibility}`,
          href: `/dashboard/documents`,
          metadata: doc,
        });
      });
    }

    // Add job posting results
    if (jobs?.jobs) {
      jobs.jobs.forEach((job) => {
        searchResults.push({
          id: job.id,
          type: "job",
          title: job.title,
          subtitle: `${job.department} • ${job.status}`,
          href: `/dashboard/recruitment/jobs/${job.id}`,
          metadata: job,
        });
      });
    }

    // Add leave request results
    if (leaves?.data) {
      leaves.data.forEach((leave: any) => {
        const employeeName = leave.employee?.user?.name ?? "Unknown Employee";
        searchResults.push({
          id: leave.id,
          type: "leave",
          title: `${leave.leaveType} Leave`,
          subtitle: `${employeeName} • ${leave.status}`,
          href: `/dashboard/leave/requests/${leave.id}`,
          metadata: leave,
        });
      });
    }

    return searchResults;
  }, [employees, documents, jobs, leaves]);

  return {
    results,
    isLoading,
    isEmpty: !isLoading && results.length === 0 && isSearching,
  };
}
