"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Bot } from "lucide-react";

export interface ChatHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  badge?: string;
  showStatus?: boolean;
}

const ChatHeader = ({
  className,
  title = "Document Assistant",
  subtitle = "Ask questions about your documents",
  badge = "AI",
  showStatus = true,
  ...props
}: ChatHeaderProps) => {
  return (
    <div
      className={cn(
        "bg-background/95 supports-[backdrop-filter]:bg-background/60 flex items-center justify-between border-b p-4 backdrop-blur",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 flex size-8 items-center justify-center rounded-full">
          <Bot className="text-primary size-4" />
        </div>
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-muted-foreground text-xs">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {showStatus && (
          <div className="flex items-center gap-1">
            <div className="size-2 rounded-full bg-green-500" />
            <span className="text-muted-foreground text-xs">Online</span>
          </div>
        )}
        <Badge variant="secondary" className="text-xs">
          {badge}
        </Badge>
      </div>
    </div>
  );
};

export { ChatHeader };
