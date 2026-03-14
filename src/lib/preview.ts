import DOMPurify from "dompurify";

import { marked } from "marked";

// Browser-compatible markdown preview
export async function renderMarkdown(md: string): Promise<string> {
  const dirty = await marked.parse(md);

  const result = DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true, mathMl: true, svg: true, svgFilters: true },
  });

  return result;
}
