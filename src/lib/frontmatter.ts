/* eslint-disable @typescript-eslint/no-explicit-any */
import matter from "gray-matter";

export interface ParsedContent {
  frontmatter: Record<string, any>;
  body: string;
  original: string;
}

export function parseMarkdown(content: string): ParsedContent {
  const result = matter(content);
  return {
    frontmatter: result.data || {},
    body: result.content,
    original: content,
  };
}

export function compileMarkdown(
  frontmatter: Record<string, any>,
  body: string,
): string {
  const fmString = Object.entries(frontmatter)
    .map(([key, value]) => {
      if (value === null || value === undefined) return "";
      if (Array.isArray(value)) {
        return `${key}: ${JSON.stringify(value)}`;
      }
      if (
        typeof value === "string" &&
        (value.includes("\n") || value.includes(":"))
      ) {
        return `${key}: "${value.replace(/"/g, '\\"')}"`;
      }
      return `${key}: ${value}`;
    })
    .filter(Boolean)
    .join("\n");

  return `---\n${fmString}\n---\n\n${body}`;
}
