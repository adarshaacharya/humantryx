"use client";

import Link from "next/link";
import React, { memo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./code-block";
import { cn } from "@/lib/utils";

const components: Partial<Components> = {
  // @ts-expect-error - CodeBlock handles the props correctly
  code: CodeBlock,
  pre: ({ children }) => <>{children}</>,
  ol: ({ children, ...props }) => {
    return (
      <ol className="ml-4 list-outside list-decimal space-y-1" {...props}>
        {children}
      </ol>
    );
  },
  ul: ({ children, ...props }) => {
    return (
      <ul className="ml-4 list-outside list-disc space-y-1" {...props}>
        {children}
      </ul>
    );
  },
  li: ({ children, ...props }) => {
    return (
      <li className="leading-relaxed" {...props}>
        {children}
      </li>
    );
  },
  strong: ({ children, ...props }) => {
    return (
      <span className="font-semibold" {...props}>
        {children}
      </span>
    );
  },
  a: ({ children, href, ...props }) => {
    return (
      <Link
        href={href || "#"}
        className="text-primary overflow-wrap-anywhere inline-block max-w-full break-all underline-offset-2 hover:underline"
        target="_blank"
        rel="noreferrer"
        {...props}
      >
        {children}
      </Link>
    );
  },
  h1: ({ children, ...props }) => {
    return (
      <h1 className="mt-4 mb-2 text-xl font-semibold first:mt-0" {...props}>
        {children}
      </h1>
    );
  },
  h2: ({ children, ...props }) => {
    return (
      <h2 className="mt-4 mb-2 text-lg font-semibold first:mt-0" {...props}>
        {children}
      </h2>
    );
  },
  h3: ({ children, ...props }) => {
    return (
      <h3 className="mt-4 mb-2 text-base font-semibold first:mt-0" {...props}>
        {children}
      </h3>
    );
  },
  h4: ({ children, ...props }) => {
    return (
      <h4 className="mt-4 mb-2 text-sm font-semibold first:mt-0" {...props}>
        {children}
      </h4>
    );
  },
  h5: ({ children, ...props }) => {
    return (
      <h5 className="mt-4 mb-2 text-sm font-semibold first:mt-0" {...props}>
        {children}
      </h5>
    );
  },
  h6: ({ children, ...props }) => {
    return (
      <h6 className="mt-4 mb-2 text-xs font-semibold first:mt-0" {...props}>
        {children}
      </h6>
    );
  },
  p: ({ children, ...props }) => {
    return (
      <p className="mb-2 leading-relaxed last:mb-0" {...props}>
        {children}
      </p>
    );
  },
};

const remarkPlugins = [remarkGfm];

interface MarkdownProps {
  children: string;
}

const NonMemoizedMarkdown = ({ children }: MarkdownProps) => {
  return (
    <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
      {children}
    </ReactMarkdown>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);
