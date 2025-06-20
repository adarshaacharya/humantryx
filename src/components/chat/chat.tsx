"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export interface ChatProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Chat = forwardRef<HTMLDivElement, ChatProps>(
  ({ className, children, ...props }, ref) => (
    <Card
      ref={ref}
      className={cn(
        "flex h-full max-h-[600px] flex-col overflow-hidden",
        className,
      )}
      {...props}
    >
      {children}
    </Card>
  ),
);
Chat.displayName = "Chat";

export { Chat };
