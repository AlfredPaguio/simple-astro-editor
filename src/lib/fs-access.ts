/**
 * File System Access Compatibility Layer
 *
 * Modern browsers (File System Access API):
 * - showDirectoryPicker
 * - showOpenFilePicker
 * - createWritable
 *
 * Legacy Chromium browsers:
 * - chooseFileSystemEntries
 * - createWriter
 *
 * HTML Input Fallback
 *    - <input type="file">
 *    - <input type="file" webkitdirectory>
 *
 * In fallback mode browsers can still:
 * - open files
 * - open folders
 * - read files
 * - browse markdown tree
 *
 * but cannot write directly to disk, so save must degrade to download.
 *
 * Portions of the legacy fallback logic are adapted from Google's
 * File System Access API sample code under Apache License 2.0.
 * @see https://github.com/GoogleChromeLabs/text-editor/
 */

interface LegacyFileWriter {
  write(position: number, data: Blob | BufferSource | string): Promise<void>;
  close(): Promise<void>;
}

interface LegacyFileHandle {
  name: string;
  kind?: "file";
  getFile(): Promise<File>;
  createWriter?: () => Promise<LegacyFileWriter>;
  createWritable?: () => Promise<FileSystemWritableFileStream>;
}

interface LegacyDirectoryHandle {
  name: string;
  kind?: "directory";
  values?: () => AsyncIterableIterator<
    LegacyFileHandle | LegacyDirectoryHandle
  >;
  getFileHandle?: (
    name: string,
    options?: { create?: boolean },
  ) => Promise<LegacyFileHandle>;
}

interface HtmlInputFileHandle {
  name: string;
  kind: "file";
  __htmlFallback: true;
  file: File;
  getFile(): Promise<File>;
}

interface HtmlInputDirectoryHandle {
  name: string;
  kind: "directory";
  __htmlFallback: true;
  files: HtmlInputFileHandle[];
}

type CompatibleFileHandle =
  | FileSystemFileHandle
  | LegacyFileHandle
  | HtmlInputFileHandle;

type CompatibleDirectoryHandle =
  | FileSystemDirectoryHandle
  | LegacyDirectoryHandle
  | HtmlInputDirectoryHandle;

export interface FileEntry {
  handle: CompatibleFileHandle;
  name: string;
  path: string;
  cachedContent?: string;
}

export interface DirectoryHandle {
  handle: CompatibleDirectoryHandle;
  name: string;
  path: string;
}

const MIME_DESCRIPTIONS: Partial<Record<string, string>> = {
  "text/markdown": "Markdown Files",
  "text/typescript": "TypeScript Files",
  "text/javascript": "JavaScript Files",
  "text/plain": "Text Files",
  "application/json": "JSON Files",
};

function createHiddenInput(
  options: {
    multiple?: boolean;
    directory?: boolean;
    accept?: string;
  } = {},
): Promise<FileList | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.style.display = "none";
    input.multiple = !!options.multiple;

    if (options.accept) input.accept = options.accept;
    if (options.directory) {
      input.setAttribute("webkitdirectory", "");
    }

    input.onchange = () => {
      resolve(input.files);
      document.body.removeChild(input);
    };

    input.oncancel = () => {
      resolve(null);
      document.body.removeChild(input);
    };

    document.body.appendChild(input);
    input.click();
  });
}

async function getLegacyOpenFileHandle(
  opts?: OpenFilePickerOptions,
): Promise<CompatibleFileHandle> {
  if ("showOpenFilePicker" in window) {
    const [handle] = await (window as any).showOpenFilePicker(opts);
    return handle;
  }

  if ("chooseFileSystemEntries" in window) {
    return await (window as any).chooseFileSystemEntries(opts);
  }

  const accept =
    opts?.types
      ?.flatMap((t) => Object.values(t.accept ?? {}).flat())
      .join(",") || "";

  const files = await createHiddenInput({
    accept,
    multiple: false,
  });

  if (!files || files.length === 0) {
    throw new DOMException("User cancelled", "AbortError");
  }

  const file = files[0];

  return {
    name: file.name,
    kind: "file",
    __htmlFallback: true,
    file,
    async getFile() {
      return file;
    },
  };
}

async function getLegacyDirectoryHandle(): Promise<CompatibleDirectoryHandle> {
  if ("showDirectoryPicker" in window) {
    return await (window as any).showDirectoryPicker({
      mode: "readwrite",
    });
  }

  if ("chooseFileSystemEntries" in window) {
    return await (window as any).chooseFileSystemEntries({
      type: "open-directory",
    });
  }

  const files = await createHiddenInput({
    directory: true,
    multiple: true,
  });

  if (!files || files.length === 0) {
    throw new DOMException("User cancelled", "AbortError");
  }

  const wrappedFiles: HtmlInputFileHandle[] = Array.from(files).map((file) => ({
    name: file.webkitRelativePath || file.name,
    kind: "file",
    __htmlFallback: true,
    file,
    async getFile() {
      return file;
    },
  }));

  return {
    name: "(root)",
    kind: "directory",
    __htmlFallback: true,
    files: wrappedFiles,
  };
}

async function readRawFile(file: File): Promise<string> {
  if (file.text) return await file.text();

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = (e) => {
      resolve((e.target as FileReader).result as string);
    };
    reader.readAsText(file);
  });
}

export async function pickDirectory(): Promise<DirectoryHandle | null> {
  try {
    const handle = await getLegacyDirectoryHandle();
    return { handle, name: handle.name || "(root)", path: "(root)" };
  } catch (err) {
    if ((err as DOMException).name === "AbortError") return null;
    console.error("Directory picker failed:", err);
    return null;
  }
}

export async function pickFile(
  types: FilePickerOptions["types"] = [
    {
      description: "Markdown Files",
      accept: { "text/markdown": [".md", ".mdx"] },
    },
  ],
): Promise<FileEntry | null> {
  try {
    const resolvedTypes = types?.map((t) => ({
      ...t,
      description:
        t.description ||
        MIME_DESCRIPTIONS[Object.keys(t.accept ?? {})[0] ?? ""] ||
        "Files",
    }));

    const handle = await getLegacyOpenFileHandle({
      types: resolvedTypes,
      multiple: false,
    });

    const file = await handle.getFile();

    return {
      handle,
      name: file.name,
      path: file.name,
    };
  } catch (err) {
    if ((err as DOMException).name === "AbortError") return null;
    console.error("File picker failed:", err);
    return null;
  }
}

export async function readFile(handle: CompatibleFileHandle): Promise<string> {
  const file = await handle.getFile();
  return await readRawFile(file);
}

export function canWriteToHandle(handle: CompatibleFileHandle): boolean {
  if ("createWriter" in handle && typeof handle.createWriter === "function") {
    return true;
  }

  if (
    "createWritable" in handle &&
    typeof handle.createWritable === "function"
  ) {
    return true;
  }

  return false;
}

export async function writeFile(
  handle: CompatibleFileHandle,
  content: string,
): Promise<void> {
  if ("createWriter" in handle && typeof handle.createWriter === "function") {
    const writer = await handle.createWriter();
    await writer.write(0, content);
    await writer.close();
    return;
  }

  if (
    "createWritable" in handle &&
    typeof handle.createWritable === "function"
  ) {
    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
    return;
  }

  throw new Error("This browser does not support direct file writing.");
}

export async function listMarkdownFiles(
  dirHandle: CompatibleDirectoryHandle,
  path: string = "",
): Promise<FileEntry[]> {
  const files: FileEntry[] = [];

  if ("__htmlFallback" in dirHandle && dirHandle.__htmlFallback) {
    for (const fileHandle of dirHandle.files) {
      const relativePath = fileHandle.name;

      if (relativePath.endsWith(".md") || relativePath.endsWith(".mdx")) {
        const file = await fileHandle.getFile();
        const content = await readRawFile(file);

        files.push({
          handle: fileHandle,
          name: relativePath.split("/").pop() || relativePath,
          path: relativePath,
          cachedContent: content,
        });
      }
    }

    return files;
  }

  if (dirHandle.values) {
    for await (const entry of dirHandle.values()) {
      const entryPath = path ? `${path}/${entry.name}` : entry.name;

      const isFile =
        entry.kind === "file" ||
        (entry.kind === undefined && "getFile" in entry);

      const isDirectory =
        entry.kind === "directory" ||
        (entry.kind === undefined &&
          !("getFile" in entry) &&
          ("values" in entry || "getFileHandle" in entry));

      if (isFile) {
        if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
          files.push({
            handle: entry as CompatibleFileHandle,
            name: entry.name,
            path: entryPath,
          });
        }
      } else if (isDirectory) {
        if (!["node_modules", ".git", "dist", "build"].includes(entry.name)) {
          const subFiles = await listMarkdownFiles(
            entry as CompatibleDirectoryHandle,
            entryPath,
          );
          files.push(...subFiles);
        }
      }
    }
  }

  return files;
}

export function isFileSystemAccessSupported(): boolean {
  return true;
}

export function detectAccessMode(): "modern" | "legacy" | "fallback" {
  if ("showDirectoryPicker" in window || "showOpenFilePicker" in window) {
    return "modern";
  }

  if ("chooseFileSystemEntries" in window) {
    return "legacy";
  }

  return "fallback";
}

export function isDirectWriteSupported(): boolean {
  const mode = detectAccessMode();
  return mode === "modern" || mode === "legacy";
}
