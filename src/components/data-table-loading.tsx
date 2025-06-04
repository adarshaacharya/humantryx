"use client";

import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DataTableLoadingProps {
  title: string;
  description?: string;
}

export function DataTableLoading({
  title,
  description,
}: DataTableLoadingProps) {
  return (
    <Alert>
      <Loader2 className="h-4 w-4 animate-spin" />
      <AlertTitle>{title}</AlertTitle>
      {description && <AlertDescription>{description}</AlertDescription>}
    </Alert>
  );
}
