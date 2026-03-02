import { remark } from "remark";
import html from "remark-html";
import sanitize from "rehype-sanitize";

// Browser-compatible markdown preview
export async function renderMarkdown(md: string): Promise<string> {
  const result = await remark()
    .use(html, { sanitize: false }) // We sanitize separately
    .use(sanitize)
    .process(md);

  return result.toString();
}
