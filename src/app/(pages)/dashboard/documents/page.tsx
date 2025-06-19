import { DocumentsPage } from "@/modules/documents/components/documents-page";
import { DocumentsErrorBoundary } from "@/modules/documents/components/documents-error-boundary";
import { Chat } from "@/modules/chat-bot/chat";

export default function DocumentsPageRoute() {
  return (
    <DocumentsErrorBoundary>
      <DocumentsPage />
      <Chat />
    </DocumentsErrorBoundary>
  );
}
