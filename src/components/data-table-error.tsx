"use client";

import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface DataTableErrorProps {
  title: string;
  description: string;
  onRetry?: () => void;
}

export function DataTableError({
  title,
  description,
  onRetry,
}: DataTableErrorProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <div className="flex items-center justify-between">
        <AlertDescription>{description}</AlertDescription>
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry}>
            Try again
          </Button>
        )}
      </div>
    </Alert>
  );
}
