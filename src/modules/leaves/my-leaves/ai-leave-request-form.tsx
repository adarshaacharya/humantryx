"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Calendar, Clock, FileText, Loader2 } from "lucide-react";

const aiLeaveRequestSchema = z.object({
  text: z
    .string()
    .min(
      10,
      "Please provide at least 10 characters describing your leave request",
    )
    .max(500, "Please keep your request under 500 characters"),
});

type AILeaveRequestForm = z.infer<typeof aiLeaveRequestSchema>;

export function AILeaveRequestForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const utils = api.useUtils();

  const form = useForm<AILeaveRequestForm>({
    resolver: zodResolver(aiLeaveRequestSchema),
    defaultValues: {
      text: "",
    },
  });

  const generateLeaveRequest = api.ai.createLeaveRequest.useMutation({
    onSuccess: (data) => {
      toast.success("Leave request created successfully!");
      setShowSuccess(true);
      form.reset();
      void utils.leave.list.invalidate();
      setTimeout(() => {
        setIsOpen(false);
      }, 2000);
    },
    onError: (error) => {
      toast.error(
        error.message || "Failed to process your request. Please try again.",
      );
    },
  });

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset form, mutation state, and success state when closing
      form.reset();
      setShowSuccess(false);
    }
  };

  const onSubmit = (data: AILeaveRequestForm) => {
    generateLeaveRequest.mutate(data);
  };

  const examplePrompts = [
    "I need sick leave from March 15 to March 17 due to flu",
    "Requesting vacation leave next week for family trip",
    "Need personal leave tomorrow for medical appointment",
    "Emergency leave from 2024-03-20 to 2024-03-22 for family emergency",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          <Sparkles className="mr-2 h-4 w-4" />
          AI Leave Request
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] min-w-2xl overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="rounded-lg bg-gradient-to-r from-purple-100 to-blue-100 p-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>
            AI-Powered Leave Request
          </DialogTitle>
          <DialogDescription className="text-base">
            Describe your leave request in natural language, and our AI will
            automatically parse the dates, duration, and reason to create your
            leave request.
          </DialogDescription>
        </DialogHeader>

        {!showSuccess ? (
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-muted-foreground text-sm font-medium">
                Try these examples:
              </h4>
              <div className="flex flex-wrap gap-2">
                {examplePrompts.map((prompt, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="hover:bg-muted cursor-pointer px-2 py-1 text-xs transition-colors"
                    onClick={() => form.setValue("text", prompt)}
                  >
                    {prompt}
                  </Badge>
                ))}
              </div>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-base">
                        <FileText className="h-4 w-4" />
                        Describe Your Leave Request
                      </FormLabel>
                      <FormDescription>
                        Include the dates, duration, and reason for your leave.
                        Be as specific as possible.
                      </FormDescription>
                      <Textarea
                        placeholder="Example: I need sick leave from March 15th to March 17th due to flu symptoms..."
                        className="min-h-[120px] resize-none"
                        {...field}
                      />
                      <FormMessage />
                      <div className="text-muted-foreground text-right text-xs">
                        {field.value?.length || 0}/500 characters
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-3 border-t pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      generateLeaveRequest.isPending ||
                      !form.watch("text")?.trim()
                    }
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {generateLeaveRequest.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Request
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>

            {/* Features */}
            <div className="bg-muted/50 space-y-3 rounded-lg p-4">
              <h4 className="text-sm font-medium">
                What our AI can understand:
              </h4>
              <div className="grid grid-cols-1 gap-3 text-xs md:grid-cols-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-purple-600" />
                  <span>Date ranges & specific dates</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-blue-600" />
                  <span>Duration & time periods</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-3 w-3 text-green-600" />
                  <span>Leave types & reasons</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border-2 border-green-200 bg-green-50 p-6 text-center">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Sparkles className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-green-800">
                Leave Request Created Successfully!
              </h3>
              <p className="text-sm text-green-700">
                Your AI-generated leave request has been submitted and is now
                pending approval.
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
