"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import Image from "next/image";
import { Markdown } from "./markdown";

export interface ChatBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "sent" | "received";
}

const ChatBubble = forwardRef<HTMLDivElement, ChatBubbleProps>(
  ({ className, variant = "received", children, id }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "flex gap-3 text-sm",
          variant === "sent" && "flex-row-reverse",
          className,
        )}
        id={id}
      >
        {children}
      </motion.div>
    );
  },
);
ChatBubble.displayName = "ChatBubble";

export interface ChatBubbleAvatarProps {
  fallback?: string;
  src?: string;
  className?: string;
}

const ChatBubbleAvatar = ({
  src,
  fallback,
  className,
}: ChatBubbleAvatarProps) => (
  <div
    className={cn(
      "bg-muted/50 flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-medium select-none",
      className,
    )}
  >
    {src ? (
      <Image
        src={src}
        alt="avatar"
        width={32}
        height={32}
        className="size-full rounded-full object-cover"
      />
    ) : (
      fallback || "AI"
    )}
  </div>
);

export interface ChatBubbleMessageProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "sent" | "received";
  isLoading?: boolean;
}

const ChatBubbleMessage = forwardRef<HTMLDivElement, ChatBubbleMessageProps>(
  (
    { className, variant = "received", isLoading = false, children, ...props },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(
        "group overflow-wrap-anywhere relative max-w-xs rounded-xl px-3 py-2 text-sm break-words shadow-sm",
        variant === "sent"
          ? "bg-primary text-primary-foreground ml-auto"
          : "bg-muted",
        isLoading && "min-w-[60px]",
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center space-x-1">
          <div className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
          <div className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
          <div className="size-1.5 animate-bounce rounded-full bg-current" />
        </div>
      ) : typeof children === "string" ? (
        <Markdown>{children}</Markdown>
      ) : (
        children
      )}
    </div>
  ),
);
ChatBubbleMessage.displayName = "ChatBubbleMessage";

// ThinkingMessage component for showing AI thinking state
export const ThinkingMessage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.5 }}
      className="flex gap-3 text-sm"
    >
      <div className="bg-primary/10 flex size-8 shrink-0 items-center justify-center rounded-full">
        <span className="text-xs">🤖</span>
      </div>
      <div className="flex max-w-xs flex-col gap-2">
        <div className="bg-muted text-muted-foreground rounded-2xl px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <motion.div
                className="bg-primary/40 h-2 w-2 rounded-full"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
              />
              <motion.div
                className="bg-primary/40 h-2 w-2 rounded-full"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              />
              <motion.div
                className="bg-primary/40 h-2 w-2 rounded-full"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
              />
            </div>
            <span className="text-xs">Scanning docs...</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage };
