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
  // Use gray-matter to safely serialize complex objects and arrays into YAML
  return matter.stringify(body, frontmatter);
}
