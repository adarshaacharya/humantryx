"use client";

import { Component, type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface DocumentsErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface DocumentsErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class DocumentsErrorBoundary extends Component<
  DocumentsErrorBoundaryProps,
  DocumentsErrorBoundaryState
> {
  constructor(props: DocumentsErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): DocumentsErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Documents module error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="container mx-auto py-6">
          <Card className="mx-auto max-w-2xl">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Documents Module Error
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Something went wrong while loading the documents module. This
                error has been logged for investigation.
              </p>
              {this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium">
                    Error Details
                  </summary>
                  <pre className="text-muted-foreground bg-muted mt-2 overflow-auto rounded p-3 text-xs">
                    {this.state.error.message}
                    {this.state.error.stack && `\n${this.state.error.stack}`}
                  </pre>
                </details>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={() => this.setState({ hasError: false })}
                  variant="outline"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  variant="default"
                >
                  Reload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
