import { cn } from "@/lib/utils";
import DOMPurify from "isomorphic-dompurify";

interface JobDescriptionRendererProps {
  content: string;
  className?: string;
}

export function JobDescriptionRenderer({
  content,
  className,
}: JobDescriptionRendererProps) {
  // Sanitize HTML content to prevent XSS attacks
  const sanitizedContent = DOMPurify.sanitize(content);

  return (
    <div
      className={cn(
        "prose prose-sm max-w-none",
        "prose-headings:font-semibold prose-headings:text-foreground",
        "prose-p:text-muted-foreground prose-p:leading-relaxed",
        "prose-strong:text-foreground prose-strong:font-semibold",
        "prose-ul:text-muted-foreground prose-ol:text-muted-foreground",
        "prose-li:text-muted-foreground",
        "prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground",
        "prose-code:bg-muted prose-code:text-foreground prose-code:px-1 prose-code:py-0.5 prose-code:rounded",
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}
