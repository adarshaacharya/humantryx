import { DocumentsPage } from "@/modules/documents/components/documents-page";
import { DocumentsErrorBoundary } from "@/modules/documents/components/documents-error-boundary";
import { FloatingDocumentChat } from "@/modules/documents/components/floating-document-chat";

export default function DocumentsPageRoute() {
  return (
    <DocumentsErrorBoundary>
      <DocumentsPage />
      <FloatingDocumentChat />
    </DocumentsErrorBoundary>
  );
}
