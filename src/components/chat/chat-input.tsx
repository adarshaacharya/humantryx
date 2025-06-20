"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Square } from "lucide-react";

export interface ChatInputProps {
  className?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  onStop?: () => void;
  multiline?: boolean;
}

const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
  (
    {
      className,
      value,
      onChange,
      onKeyDown,
      placeholder = "Type your message...",
      disabled,
      onSubmit,
      isLoading = false,
      onStop,
      multiline = false,
      ...props
    },
    ref,
  ) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !multiline) {
        e.preventDefault();
        const form = e.currentTarget.form;
        if (form) {
          form.requestSubmit();
        }
      }
      onKeyDown?.(e);
    };

    return (
      <form onSubmit={onSubmit} className="relative">
        <Textarea
          ref={ref}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "bg-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-[48px] resize-none rounded-2xl border px-4 py-3 pr-16 text-sm focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            multiline ? "min-h-[80px]" : "max-h-32",
            className,
          )}
          onKeyDown={handleKeyDown}
          {...props}
        />
        <div className="absolute top-1/2 right-2 -translate-y-1/2">
          {isLoading ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 rounded-full"
              onClick={onStop}
            >
              <Square className="size-4" />
              <span className="sr-only">Stop generating</span>
            </Button>
          ) : (
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="size-8 rounded-full"
              disabled={!value || isLoading}
            >
              <Send className="size-4" />
              <span className="sr-only">Send message</span>
            </Button>
          )}
        </div>
      </form>
    );
  },
);
ChatInput.displayName = "ChatInput";

export { ChatInput };
