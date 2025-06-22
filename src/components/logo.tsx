"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface LogoProps {
  /**
   * Size variant for the logo
   */
  size?: "sm" | "md" | "lg" | "xl";
  /**
   * Whether the logo should be clickable and navigate to home
   */
  clickable?: boolean;
  /**
   * Custom className for styling
   */
  className?: string;
  /**
   * Whether to show the text alongside the icon
   */
  showText?: boolean;
  /**
   * Custom onClick handler (overrides default navigation)
   */
  onClick?: () => void;
}

const sizeConfig = {
  sm: {
    container: "h-6 w-6",
    text: "text-base",
    icon: "text-sm",
    dot: "h-1.5 w-1.5",
  },
  md: {
    container: "h-8 w-8",
    text: "text-xl",
    icon: "text-lg",
    dot: "h-2 w-2",
  },
  lg: {
    container: "h-10 w-10",
    text: "text-2xl",
    icon: "text-xl",
    dot: "h-2.5 w-2.5",
  },
  xl: {
    container: "h-12 w-12",
    text: "text-3xl",
    icon: "text-2xl",
    dot: "h-3 w-3",
  },
};

export function Logo({
  size = "md",
  clickable = true,
  className,
  showText = true,
  onClick,
}: LogoProps) {
  const router = useRouter();
  const config = sizeConfig[size];

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (clickable) {
      router.push("/");
    }
  };

  const logoIcon = (
    <div className="relative">
      <div
        className={cn(
          "flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg",
          config.container,
        )}
      >
        <div className="relative">
          <span className={cn("font-bold text-white", config.icon)}>H</span>
          <div
            className={cn(
              "absolute -top-1 -right-1 animate-pulse rounded-full bg-emerald-400",
              config.dot,
            )}
          />
        </div>
      </div>
    </div>
  );

  const logoText = showText && (
    <span
      className={cn(
        "bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text font-bold text-transparent",
        config.text,
      )}
    >
      Humantryx
    </span>
  );

  if (clickable || onClick) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn("flex cursor-pointer items-center space-x-2", className)}
        onClick={handleClick}
      >
        {logoIcon}
        {logoText}
      </motion.div>
    );
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {logoIcon}
      {logoText}
    </div>
  );
}
