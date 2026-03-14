import { Skeleton } from "@/components/ui/skeleton";
import { renderMarkdown } from "@/lib/preview";
import { cn } from "@/lib/utils";
import { AlertCircle, Clock, FileText } from "lucide-react";
import { useEffect, useState } from "react";

interface PreviewPaneProps {
  markdown: string;
  className?: string;
}

export function PreviewPane({ markdown, className }: PreviewPaneProps) {
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const text = markdown.trim();
  const words = text ? text.split(/\s+/).length : 0;
  const readingTime = Math.ceil(words / 200);

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      if (!text) {
        setHtml("");
        setError(null);
        return;
      }
      setLoading(true);
      setError(null);

      try {
        const result = await renderMarkdown(markdown);
        if (!cancelled) {
          setHtml(result);
        }
      } catch (err) {
        console.error("Preview render failed:", err);
        if (!cancelled) {
          setError("Failed to render preview");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markdown]);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Stats Bar */}
      <div className="flex items-center gap-4 px-4 py-2 border-b bg-muted/30 text-xs text-muted-foreground shrink-0">
        <div className="flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" />
          <span>{words} words</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          <span>~{readingTime} min read</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto relative w-full">
        {loading && (
          <div className="absolute inset-0 p-6 space-y-4 bg-background z-10">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && !html && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm gap-2 bg-white">
            <FileText className="h-8 w-8 opacity-30" />
            <span>Nothing to preview yet</span>
          </div>
        )}

        {!loading && !error && html && (
          <div
            className="prose max-w-full dark:prose bg-white p-6 w-full h-full contain-content overflow-auto"
            style={{ width: "100%", maxWidth: "100%" }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
    </div>
  );
}
