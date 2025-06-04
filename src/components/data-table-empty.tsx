"use client";

import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DataTableEmptyProps {
  title: string;
  description?: string;
}

export function DataTableEmpty({ title, description }: DataTableEmptyProps) {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      {description && <AlertDescription>{description}</AlertDescription>}
    </Alert>
  );
}
