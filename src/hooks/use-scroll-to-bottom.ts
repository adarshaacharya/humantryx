import { useEffect, useRef, type RefObject } from "react";

export function useScrollToBottom<T extends HTMLElement>(): [
  RefObject<T | null>,
  RefObject<T | null>,
] {
  const containerRef = useRef<T>(null);
  const endRef = useRef<T>(null);

  useEffect(() => {
    const container = containerRef.current;
    const end = endRef.current;

    if (container && end) {
      const observer = new MutationObserver(() => {
        // Use requestAnimationFrame to ensure DOM updates are complete
        requestAnimationFrame(() => {
          end.scrollIntoView({ behavior: "instant", block: "end" });
        });
      });

      observer.observe(container, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });

      // Initial scroll to bottom
      end.scrollIntoView({ behavior: "instant", block: "end" });

      return () => observer.disconnect();
    }
  }, []);

  return [containerRef, endRef];
}
