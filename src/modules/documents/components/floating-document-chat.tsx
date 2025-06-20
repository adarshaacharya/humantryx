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
  <div className="flex h-full flex-col items-center justify-center p-6 text-center">
    <div className="mb-4">
      <div className="bg-primary/10 mx-auto mb-3 flex size-12 items-center justify-center rounded-full">
        <Bot className="text-primary size-6" />
      </div>
    </div>

    <h3 className="mb-2 text-lg font-semibold">Document Assistant</h3>
    <p className="text-muted-foreground mb-4 text-xs">
      Ask me about company documents and policies
    </p>

    <div className="grid w-full gap-2">
      <Button
        variant="outline"
        size="sm"
        className="h-auto justify-start p-3 text-left text-xs"
        onClick={() => onSuggestionClick("What's our remote work policy?")}
      >
        📖 Remote Work Policy
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="h-auto justify-start p-3 text-left text-xs"
        onClick={() => onSuggestionClick("Show me the employee handbook")}
      >
        📄 Employee Handbook
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="h-auto justify-start p-3 text-left text-xs"
        onClick={() => onSuggestionClick("Find safety procedures")}
      >
        🛡️ Safety Procedures
      </Button>
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
              className="bg-background/95 supports-[backdrop-filter]:bg-background/90 flex flex-col overflow-hidden rounded-2xl border shadow-2xl backdrop-blur transition-all duration-300"
              style={{
                width: isLargeSize ? "400px" : "320px",
                height: isLargeSize ? "600px" : "500px",
              }}
            >
              {/* Header */}
              <div className="from-background to-muted/30 flex items-center justify-between border-b bg-gradient-to-r p-3">
                <div className="flex items-center gap-2">
                  <div className="size-2 animate-pulse rounded-full bg-green-500" />
                  <h3 className="text-sm font-semibold">Document Assistant</h3>
                  <Badge
                    variant="secondary"
                    className="h-5 px-2 py-0.5 text-xs"
                  >
                    AI ✨
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-primary/10 h-6 w-6"
                    onClick={toggleSize}
                    title={isLargeSize ? "Make smaller" : "Make larger"}
                  >
                    {isLargeSize ? (
                      <Minimize className="h-3 w-3" />
                    ) : (
                      <Maximize2 className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-primary/10 h-6 w-6"
                    onClick={() => setIsOpen(false)}
                  >
                    <Minimize2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-red-100 hover:text-red-600"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-hidden">
                <ChatMessageList className="h-full">
                  <AnimatePresence mode="popLayout">
                    {visibleMessages.length === 0 ? (
                      <FloatingWelcomeScreen
                        onSuggestionClick={handleSuggestionClick}
                      />
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
                  </AnimatePresence>
                </ChatMessageList>
              </div>

              {/* Input */}
              <div className="bg-background/80 border-t p-3 backdrop-blur">
                <ChatInput
                  value={input}
                  onChange={handleInputChange}
                  onSubmit={handleSubmit}
                  isLoading={isLoading || status === "submitted"}
                  placeholder="Ask about documents..."
                  disabled={isLoading || status === "submitted"}
                />

                <div className="text-muted-foreground mt-2 flex items-center justify-between text-xs">
                  <span className="truncate">
                    {status === "submitted"
                      ? "Processing..."
                      : isLoading
                        ? "AI is responding..."
                        : "Ask about policies & documents"}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    AI
                  </Badge>
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
            className="from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 group relative h-14 w-14 overflow-hidden rounded-full bg-gradient-to-r shadow-lg transition-all duration-200 hover:shadow-xl"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            />
            <MessageCircle className="relative z-10 h-6 w-6" />
          </Button>
          <motion.div
            className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </div>
    </>
  );
};
