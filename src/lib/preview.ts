import { remark } from "remark";
import html from "remark-html";

// Browser-compatible markdown preview
export async function renderMarkdown(md: string): Promise<string> {
  const result = await remark()
    .use(html, { sanitize: true })
    .process(md);

  return result.toString();
}
