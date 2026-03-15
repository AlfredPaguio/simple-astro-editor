# Astro Content Editor

A browser-based Markdown editor purpose-built for [Astro](https://astro.build) content collections. Load your `content.config.ts`, open your content folder, and edit frontmatter through a generated schema form - all without leaving the browser and without a build step.

---

## Features

### Schema-Aware Frontmatter Editing

Load your Astro `content.config.ts` and the editor parses your Zod schemas to generate a typed form for every frontmatter field. Fields not covered by the schema are inferred from the file and shown with an "inferred" badge. Unknown fields outside both the schema and the file are surfaced separately so nothing gets silently dropped.

### File System Access API

Uses the browser's native [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API) to read and write files directly to disk - no server, no uploads, no sync. Pick a folder, edit, save. Changes write back to the original file instantly.

### Dual-Pane Editor / Preview

A resizable, draggable split-pane layout powered by `react-grid-layout`:

- **Editor** - Monaco-style Markdown editor powered by [react-codemirror](https://github.com/uiwjs/react-codemirror)
- **Preview** - live rendered Markdown output. [markedjs](https://github.com/markedjs/marked) and sanitized using [DOMPurify](https://github.com/cure53/DOMPurify)
- Switch between **Editor only**, **Split**, or **Preview only** from the toolbar
- Per-panel controls to **expand** left or right (taking over the sibling's space) and **swap** panel positions
- Layout persisted to `localStorage` across sessions

### Dual Sidebar Layout

- **Left sidebar** - file tree with folder collapsing, collection selector (list for ≤4 collections, searchable combobox for more)
- **Right sidebar** - frontmatter form, 100svh wide, overlays content without layout shift
- Both sidebars use [shadcn/ui Sidebar](https://ui.shadcn.com/docs/components/sidebar) with the `SidebarManager` pattern for independent control
- Both sidebars are independently toggleable with no cross-interference

### Keyboard Shortcuts

| Shortcut       | Action                     |
| -------------- | -------------------------- |
| `Cmd/Ctrl + B` | Toggle file sidebar        |
| `Alt + B`      | Toggle frontmatter sidebar |

Powered by [@tanstack/react-hotkeys](https://github.com/tanstack/hotkeys).

### Download & Save

- **Save** - writes back to the original file via File System Access API (requires a loaded folder)
- **Download** - exports the compiled Markdown + frontmatter as a `.md` file via blob URL, works without folder access

---

## Tech Stack

| Category          | Library                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------ |
| Framework         | [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org)                  |
| Styling           | [Tailwind CSS v4](https://tailwindcss.com)                                                 |
| UI Components     | [shadcn/ui](https://ui.shadcn.com)                                                         |
| Layout            | [react-grid-layout](https://github.com/react-grid-layout/react-grid-layout)                |
| Code Editor       | [react-codemirror](https://github.com/uiwjs/react-codemirror)                              |
| Hotkeys           | [@tanstack/react-hotkeys](https://github.com/tanstack/hotkeys)                             |
| Frontmatter       | [gray-matter](https://github.com/jonschlinkert/gray-matter)                                |
| Schema Evaluation | Custom Zod schema evaluator via `evaluateConfigText` and also uses Zod v4's `toJSONSchema` |
| File System       | [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A modern browser with File System Access API support

### Installation

```bash
git clone https://github.com/AlfredPaguio/simple-astro-editor.git
cd simple-astro-editor
npm install
npm run postinstall
npm run dev
```

### Usage

1. **Load config** - Click **Config** in the header and pick your `content.config.ts` (or `.js`). The editor parses your collection schemas.

2. **Open folder** - Click **Folder** and select your Astro `src/content` directory. The file tree populates in the left sidebar.

3. **Select a collection** - Pick a collection from the left sidebar to associate its schema with the frontmatter form.

4. **Edit a file** - Click any `.md` or `.mdx` file in the tree. The editor loads the body and the right sidebar populates the frontmatter form.

5. **Save** - Click **Save** to write back to disk, or **Download** to grab a `.md` file.

---

## Project Structure

```md
src/
├── main.tsx                          # Entry point, Buffer polyfill for gray-matter
├── App.tsx                           # Router - `/` (editor) and `/tester` (dev sandbox)
├── MainEditor.tsx                    # Root editor component + layout shell
├── Tester.tsx                        # Dev sandbox for testing schema evaluation
│
├── _partials/
│   ├── MainEditorPanels.tsx          # Split-pane editor/preview grid + view mode toolbar
│   └── PanelControls.tsx             # Per-panel expand left/right + swap controls
│
├── components/
│   ├── file-sidebar.tsx        # Left sidebar - file tree + collection selector
│   ├── frontmatter-sidebar.tsx # Right sidebar - schema form
│   ├── sidebar-manager.tsx     # Multi-sidebar registry (SidebarManager pattern)
│   ├── site-header.tsx         # Header with toolbar + sidebar toggles + hotkeys
│   ├── site-footer.tsx         # Footer
│   ├── FileSystemAccessAlert.tsx     # Banner shown when File System Access API is unavailable
│   ├── MarkdownEditor.tsx      # CodeMirror Markdown editor pane
│   ├── PreviewPane.tsx         # Rendered Markdown preview
│   ├── mode-toggle.tsx               # Light/dark mode toggle button
│   ├── theme-provider.tsx            # Theme context provider
│   │
│   └── schema-form/
│       ├── SchemaForm.tsx            # Top-level form, renders fields from JSON schema
│       ├── SchemaField.tsx           # Routes each field to the correct field component
│       ├── SchemaFormContext.tsx     # Shared form context (values, onChange)
│       ├── FieldLabelContent.tsx    # Field label with type badge and inferred indicator
│       ├── FieldTypeIcon.tsx         # Icon mapped from JSON schema type
│       └── fields/
│           ├── StringField.tsx       # text / textarea input
│           ├── NumberField.tsx       # number input
│           ├── BooleanField.tsx      # checkbox / switch
│           ├── EnumField.tsx         # select dropdown
│           ├── DateField.tsx         # date picker
│           ├── NestedObjectField.tsx # collapsible nested object
│           └── array/
│               ├── ArrayField.tsx          # array container + add/remove controls
│               ├── ArrayObjectField.tsx    # array of objects (each item is a sub-form)
│               └── ArrayPrimitiveField.tsx # array of strings/numbers
│
├── hooks/
│   └── useEditorLayout.ts            # Grid layout state, expand, swap, localStorage persist
│
└── lib/
    ├── file-tree-utils.ts            # Build + sort file tree from flat FileEntry list
    ├── frontmatter.ts                # Parse and compile Markdown + YAML frontmatter
    ├── fs-access.ts                  # File System Access API wrappers (pick, read, write)
    ├── inference.ts                  # Categorise frontmatter keys: known / inferred / unknown
    ├── preview.ts                    # Markdown-to-HTML rendering utilities
    └── schema-evaluator.ts           # Execute content.config.ts, extract Zod schemas as JSON Schema
```

---

## Architecture Notes

### Sidebar Manager

shadcn's `SidebarProvider` only controls one sidebar per context. To independently toggle two sidebars from a single header, a custom `SidebarManager` registry is used - each sidebar registers itself by name on mount, and `SidebarManagerTrigger` (or `useSidebarManager`) can look up and toggle any sidebar by name from anywhere in the tree.

### Schema Evaluation

`evaluateConfigText` executes the config file in a sandboxed context (`esbuid`) to extract Zod schema definitions without requiring a full Astro build. Zod v4's `toJSONSchema` converts the schemas to standard JSON Schema, which the form renderer uses to generate typed inputs. Field analysis (`analyzeFields`) then categorizes each frontmatter key as **known** (in schema), **inferred** (in file but not schema), or **unknown** (neither).

### Layout Persistence

Panel layouts are stored in `localStorage` under `panel-layout` as a breakpoint map (`lg`, `md`, `sm`, `xs`, `xxs`). On load, the saved layout is validated before use; if invalid or absent, default 50/50 split layouts are generated per breakpoint.

---

## Browser Compatibility

The editor degrades gracefully on unsupported browsers - the **Download** button works everywhere; **Save** requires File System Access API write support.

---

## License

MIT
