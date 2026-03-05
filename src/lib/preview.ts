import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

// Browser-compatible markdown preview
export async function renderMarkdown(md: string): Promise<string> {
  const result = await unified()
    .use(remarkParse, { fragment: true })
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(md);

  return result.toString();
}
