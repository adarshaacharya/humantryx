"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom";

export interface ChatMessageListProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const ChatMessageList = forwardRef<HTMLDivElement, ChatMessageListProps>(
  ({ className, children, ...props }, _ref) => {
    const [messagesContainerRef, messagesEndRef] =
      useScrollToBottom<HTMLDivElement>();

    return (
      <ScrollArea className={cn("flex-1", className)}>
        <div
          ref={messagesContainerRef}
          className="flex flex-col gap-4 p-4"
          {...props}
        >
          {children}
          {/* Invisible div to scroll to */}
          <div ref={messagesEndRef} className="h-px w-full" />
        </div>
      </ScrollArea>
    );
  },
);
ChatMessageList.displayName = "ChatMessageList";

export { ChatMessageList };
