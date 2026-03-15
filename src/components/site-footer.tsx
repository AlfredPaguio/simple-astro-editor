import { Terminal } from "lucide-react";

const links: { title: string; href: string }[] = [
  { title: "Made by Alfred Paguio", href: "https://github.com/AlfredPaguio" },
  {
    title: "Repository",
    href: "https://github.com/AlfredPaguio/simple-astro-editor",
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t bg-background px-6 py-2 shrink-0">
      <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
        {/* Brand */}
        <a
          className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground hover:text-primary transition-colors"
          href="/"
        >
          <Terminal className="h-4 w-4 text-primary" />
          Astro Content Editor
        </a>
        
        {/* Copyright */}
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Astro Content Editor
        </p>

        {/* Links */}
        <ul className="flex items-center gap-5">
          {links.map(({ title, href }) => (
            <li key={title}>
              <a
                href={href}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
