"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageCircle,
  Minimize2,
  X,
  Bot,
  Maximize2,
  Minimize,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ChatMessageList } from "../../../components/chat/chat-message-list";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
  ThinkingMessage,
} from "../../../components/chat/chat-bubble";
import { ChatInput } from "../../../components/chat/chat-input";

const FloatingWelcomeScreen = ({
  onSuggestionClick,
}: {
  onSuggestionClick: (suggestion: string) => void;
}) => (
  <div className="flex h-full flex-col p-6">
    {/* Header Section */}
    <div className="mb-6 text-center">
      <div className="mb-4">
        <div className="bg-primary/10 ring-primary/5 mx-auto mb-3 flex size-16 items-center justify-center rounded-full ring-4">
          <Bot className="text-primary size-8" />
        </div>
      </div>
      <h3 className="mb-2 text-xl font-bold">Document Assistant</h3>
      <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
        Your AI-powered guide to company documents, policies, and procedures.
        Get instant answers and find what you need.
      </p>
    </div>

    {/* Quick Actions */}
    <div className="mb-6 space-y-3">
      <h4 className="text-muted-foreground mb-3 text-sm font-semibold">
        Quick Actions
      </h4>

      <Button
        variant="outline"
        size="sm"
        className="hover:bg-primary/5 hover:border-primary/20 h-auto w-full justify-start p-4 text-left transition-colors"
        onClick={() => onSuggestionClick("What's our remote work policy?")}
      >
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
            <span className="text-blue-600 dark:text-blue-400">🏠</span>
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-medium">Remote Work Policy</div>
            <div className="text-muted-foreground text-xs">
              Work from home guidelines
            </div>
          </div>
        </div>
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="hover:bg-primary/5 hover:border-primary/20 h-auto w-full justify-start p-4 text-left transition-colors"
        onClick={() => onSuggestionClick("What are the leave policies?")}
      >
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
            <span className="text-purple-600 dark:text-purple-400">🌴</span>
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-medium">Leave Policies</div>
            <div className="text-muted-foreground text-xs">
              Vacation & time-off rules
            </div>
          </div>
        </div>
      </Button>
    </div>

    {/* Help Section */}
    <div className="mt-auto">
      <div className="bg-muted/30 rounded-lg border border-dashed p-4">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 rounded-full p-2">
            <span className="text-xs">💡</span>
          </div>
          <div className="flex-1">
            <h5 className="mb-1 text-sm font-medium">Pro Tip</h5>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Be specific in your questions! Try &ldquo;What&rsquo;s the process
              for requesting time off?&rdquo; instead of just &ldquo;time
              off&rdquo;.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const FloatingDocumentChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLargeSize, setIsLargeSize] = useState(false);

  const { messages, input, handleInputChange, handleSubmit, status, append } =
    useChat({
      api: "/api/chat",
      initialMessages: [
        {
          id: "welcome",
          role: "system",
          content:
            "Welcome! I'm your document assistant. How can I help you today?",
        },
      ],
      onError: (e) => {
        toast.error(
          e.message || "An error occurred while processing your request.",
        );
      },
    });

  const toggleSize = () => {
    setIsLargeSize(!isLargeSize);
  };

  const handleSuggestionClick = (suggestion: string) => {
    void append({
      role: "user",
      content: suggestion,
    });
  };

  const visibleMessages = messages.filter((m) => m.role !== "system");
  const isLoading = status === "streaming";

  return (
    <>
      {/* Backdrop blur when chat is open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[1px]"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Chat Window - Fixed Position */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-4 bottom-20 z-50"
          >
            <div
              className="bg-background/95 supports-[backdrop-filter]:bg-background/90 flex max-h-[calc(100vh-6rem)] flex-col overflow-hidden rounded-2xl border shadow-2xl backdrop-blur transition-all duration-300"
              style={{
                width: isLargeSize ? "480px" : "420px",
                height: isLargeSize ? "720px" : "640px",
              }}
            >
              {/* Header */}
              <div className="from-background to-muted/30 flex items-center justify-between border-b bg-gradient-to-r p-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="size-2 animate-pulse rounded-full bg-green-500" />
                    <div className="absolute inset-0 size-2 animate-ping rounded-full bg-green-400 opacity-75" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Document Assistant</h3>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="h-4 px-2 py-0.5 text-xs"
                      >
                        AI ✨
                      </Badge>
                      <span className="text-muted-foreground text-xs">
                        {visibleMessages.length === 0
                          ? "Ready to help"
                          : `${visibleMessages.length} messages`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-primary/10 h-7 w-7"
                    onClick={toggleSize}
                    title={isLargeSize ? "Make smaller" : "Make larger"}
                  >
                    {isLargeSize ? (
                      <Minimize className="h-3.5 w-3.5" />
                    ) : (
                      <Maximize2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-primary/10 h-7 w-7"
                    onClick={() => setIsOpen(false)}
                  >
                    <Minimize2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 hover:bg-red-100 hover:text-red-600"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              {/* Messages */}
              <div className="min-h-0 flex-1 overflow-hidden">
                <ChatMessageList className="h-full">
                  <>
                    {visibleMessages.length === 0 ? (
                      <motion.div
                        key="welcome"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <FloatingWelcomeScreen
                          onSuggestionClick={handleSuggestionClick}
                        />
                      </motion.div>
                    ) : (
                      <>
                        {visibleMessages.map((message, index) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                          >
                            <ChatBubble
                              variant={
                                message.role === "user" ? "sent" : "received"
                              }
                            >
                              <ChatBubbleAvatar
                                fallback={message.role === "user" ? "👤" : "🤖"}
                              />
                              <ChatBubbleMessage
                                variant={
                                  message.role === "user" ? "sent" : "received"
                                }
                              >
                                {message.content}
                              </ChatBubbleMessage>
                            </ChatBubble>
                          </motion.div>
                        ))}

                        {/* Show thinking message when user just submitted and we're waiting for AI response */}
                        {status === "submitted" &&
                          visibleMessages.length > 0 &&
                          visibleMessages[visibleMessages.length - 1]?.role ===
                            "user" && <ThinkingMessage />}

                        {/* Show loading bubble when streaming */}
                        {isLoading && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChatBubble variant="received">
                              <ChatBubbleAvatar fallback="🤖" />
                              <ChatBubbleMessage isLoading />
                            </ChatBubble>
                          </motion.div>
                        )}
                      </>
                    )}
                  </>
                </ChatMessageList>
              </div>

              {/* Input */}
              <div className="bg-background/90 border-t p-4 backdrop-blur">
                <div className="space-y-3">
                  <ChatInput
                    value={input}
                    onChange={handleInputChange}
                    onSubmit={handleSubmit}
                    isLoading={isLoading || status === "submitted"}
                    placeholder="Ask about policies, procedures, or documents..."
                    disabled={isLoading || status === "submitted"}
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="text-muted-foreground flex items-center gap-1 text-xs">
                        <div
                          className={`size-1.5 rounded-full ${
                            status === "submitted"
                              ? "animate-pulse bg-yellow-500"
                              : isLoading
                                ? "animate-pulse bg-blue-500"
                                : "bg-green-500"
                          }`}
                        />
                        <span className="truncate">
                          {status === "submitted"
                            ? "Processing your request..."
                            : isLoading
                              ? "AI is thinking..."
                              : "Ready to help with documents"}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Powered by AI
                    </Badge>
                  </div>

                  {/* Quick suggestions when not actively chatting */}
                  {visibleMessages.length > 0 &&
                    !isLoading &&
                    status !== "submitted" && (
                      <div className="flex flex-wrap gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-primary/10 h-6 px-2 py-1 text-xs"
                          onClick={() =>
                            handleSuggestionClick(
                              "Can you summarize this document?",
                            )
                          }
                        >
                          📄 Summarize
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-primary/10 h-6 px-2 py-1 text-xs"
                          onClick={() =>
                            handleSuggestionClick("Find related policies")
                          }
                        >
                          🔗 Related
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-primary/10 h-6 px-2 py-1 text-xs"
                          onClick={() =>
                            handleSuggestionClick("What are the key points?")
                          }
                        >
                          ⚡ Key Points
                        </Button>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button - Fixed Position */}
      <div className="fixed right-4 bottom-4 z-50">
        <motion.div
          key="fab"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative"
        >
          <Button
            onClick={() => setIsOpen(!isOpen)}
            size="lg"
            className="from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 group ring-primary/10 hover:ring-primary/20 relative h-16 w-16 overflow-hidden rounded-full bg-gradient-to-r shadow-lg ring-4 transition-all duration-200 hover:shadow-xl"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            />
            <MessageCircle className="relative z-10 h-7 w-7" />
          </Button>

          {/* Status indicator */}
          <motion.div
            className="border-background absolute -top-1 -right-1 h-4 w-4 rounded-full border-2 bg-green-500"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Tooltip when not open */}
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-1/2 right-full mr-3 -translate-y-1/2 whitespace-nowrap"
            >
              <div className="bg-foreground text-background rounded-lg px-3 py-2 text-sm font-medium shadow-lg">
                Ask about documents
                <div className="border-l-foreground absolute top-1/2 left-full -translate-y-1/2 border-4 border-transparent" />
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </>
  );
};
