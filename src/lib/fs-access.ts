export interface FileEntry {
  handle: FileSystemFileHandle;
  name: string;
  path: string;
}

export interface DirectoryHandle {
  handle: FileSystemDirectoryHandle;
  name: string;
  path: string;
}

export async function pickDirectory(): Promise<DirectoryHandle | null> {
  try {
    const handle = await window.showDirectoryPicker({
      mode: "readwrite",
    });
    return {
      handle,
      name: handle.name,
      path: "(root)",
    };
  } catch (err) {
    if ((err as DOMException).name === "AbortError") {
      return null; // User cancelled
    }
    console.error("Directory picker failed:", err);
    return null;
  }
}

export async function pickFile(
  acceptTypes: Record<`${string}/${string}`, `.${string}`[]> = {
    "text/markdown": [".md", ".mdx"],
    "text/typescript": [".ts"],
  },
): Promise<FileEntry | null> {
  try {
    const [handle] = await window.showOpenFilePicker({
      types: [{ description: "Files", accept: acceptTypes }],
      multiple: false,
    });
    const file = await handle.getFile();
    return {
      handle,
      name: file.name,
      path: file.name,
    };
  } catch (err) {
    if ((err as DOMException).name === "AbortError") {
      return null;
    }
    console.error("File picker failed:", err);
    return null;
  }
}

export async function readFile(handle: FileSystemFileHandle): Promise<string> {
  const file = await handle.getFile();
  return await file.text();
}

export async function writeFile(
  handle: FileSystemFileHandle,
  content: string,
): Promise<void> {
  const writable = await handle.createWritable();
  await writable.write(content);
  await writable.close();
}

export async function createBackup(
  dirHandle: FileSystemDirectoryHandle,
  fileHandle: FileSystemFileHandle,
  content: string,
): Promise<void> {
  const backupName = fileHandle.name + ".bak";

  // Create backup in same directory
  const backupHandle = await dirHandle.getFileHandle(backupName, {
    create: true,
  });

  await writeFile(backupHandle, content);
}

export async function listMarkdownFiles(
  dirHandle: FileSystemDirectoryHandle,
  path: string = "",
): Promise<FileEntry[]> {
  const files: FileEntry[] = [];

  for await (const entry of dirHandle.values()) {
    const entryPath = path ? `${path}/${entry.name}` : entry.name;

    if (entry.kind === "file") {
      if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
        files.push({
          handle: entry as FileSystemFileHandle,
          name: entry.name,
          path: entryPath,
        });
      }
    } else if (entry.kind === "directory") {
      // Skip common non-content directories
      if (!["node_modules", ".git", "dist", "build"].includes(entry.name)) {
        const subFiles = await listMarkdownFiles(
          entry as FileSystemDirectoryHandle,
          entryPath,
        );
        files.push(...subFiles);
      }
    }
  }

  return files;
}

export function isFileSystemAccessSupported(): boolean {
  return "showDirectoryPicker" in window && "showOpenFilePicker" in window;
}
