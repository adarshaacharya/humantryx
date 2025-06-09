import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";

const spinnerVariants = cva("animate-spin", {
  variants: {
    size: {
      small: "h-4 w-4",
      medium: "h-8 w-8",
      large: "h-12 w-12",
    },
  },
  defaultVariants: {
    size: "small",
  },
});

interface SpinnerContentProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
}

export function Spinner({ size, className }: SpinnerContentProps) {
  return <Loader2 className={cn(spinnerVariants({ size }), className)} />;
}
