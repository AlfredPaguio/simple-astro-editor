import { useEffect, useState } from "react";
import { renderMarkdown } from "@/lib/preview";
import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";

interface PreviewPaneProps {
  markdown: string;
  className?: string;
}

export function PreviewPane({ markdown, className }: PreviewPaneProps) {
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      setLoading(true);
      try {
        const result = await renderMarkdown(markdown);
        if (!cancelled) {
          setHtml(result);
        }
      } catch (err) {
        console.error("Preview render failed:", err);
        if (!cancelled) {
          setHtml('<p class="text-red-500">Preview failed to render</p>');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    // Debounce preview rendering
    const timeout = setTimeout(render, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [markdown]);

  return (
    <>
      {loading && (
        <Skeleton
          className="border rounded-md p-6 overflow-auto bg-white prose prose-sm max-w-none
          prose-headings:font-semibold prose-a:text-blue-600 prose-img:rounded-lg"
        />
      )}
      <div
        className={cn(
          "border rounded-md p-6 overflow-auto bg-white prose prose-sm max-w-none",
          "prose-headings:font-semibold prose-a:text-blue-600 prose-img:rounded-lg",
          className,
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  );
}
