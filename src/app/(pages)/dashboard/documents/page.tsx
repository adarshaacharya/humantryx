import { DocumentsPage } from "@/modules/documents/components/documents-page";
import { DocumentsErrorBoundary } from "@/modules/documents/components/documents-error-boundary";

export default function DocumentsPageRoute() {
  return (
    <DocumentsErrorBoundary>
      <DocumentsPage />
    </DocumentsErrorBoundary>
  );
}
