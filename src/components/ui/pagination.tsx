"use client";

import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface PaginationProps {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  pageIndex,
  pageCount,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-end space-x-2 py-4">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(0)}
        disabled={pageIndex === 0}
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(pageIndex - 1)}
        disabled={pageIndex === 0}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" className="min-w-[100px]">
        Page {pageIndex + 1} of {pageCount}
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(pageIndex + 1)}
        disabled={pageIndex === pageCount - 1}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(pageCount - 1)}
        disabled={pageIndex === pageCount - 1}
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
