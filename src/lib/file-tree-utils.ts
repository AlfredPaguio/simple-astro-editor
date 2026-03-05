import type { FileEntry } from "@/lib/fs-access";

export interface TreeNode {
  name: FileEntry["name"];
  path?: Partial<FileEntry["path"]>; // Only present on file nodes
  children?: TreeNode[];
  fileHandle?: FileEntry; // Only present on file nodes
  isFile?: boolean;
}

/**
 * Converts a flat list of FileHandles into a nested Tree structure.
 * Keeps logic out of the UI component.
 */
export function buildFileTree(files: FileEntry[]): TreeNode[] {
  const root: TreeNode[] = [];
  const map = new Map<string, TreeNode>();

  // Sort files to ensure folders appear before files if needed,
  // but primarily to ensure parent paths exist before children
  const sortedFiles = [...files].sort((a, b) => a.path.localeCompare(b.path));
  // might brake like folder1/file.md vs folder10/file.md
  // const sortedFiles = [...files].sort((a, b) => {
  //   const aIsFile = a.handle.kind === "file";
  //   const bIsFile = b.handle.kind === "file";

  //   // folders first
  //   if (aIsFile !== bIsFile) {
  //     return aIsFile ? 1 : -1;
  //   }

  //   // 2️then alphabetical
  //   return a.name.localeCompare(b.name);
  // });

  for (const file of sortedFiles) {
    const parts = file.path.split("/");
    let currentPath = "";
    let parent: TreeNode[] = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      const existing = map.get(currentPath);
      if (existing) {
        parent = existing.children || [];
        continue;
      }

      const node: TreeNode = {
        name: part,
        isFile,
        path: currentPath,
        children: [],
        fileHandle: isFile ? file : undefined,
      };

      parent.push(node);
      map.set(currentPath, node);

      if (!isFile) {
        parent = node.children || [];
      }
    }
  }

  return root;
}

export function sortTree(nodes: TreeNode[]) {
  nodes.sort((a, b) => {
    if (a.isFile !== b.isFile) {
      return a.isFile ? 1 : -1; // folders first
    }
    return a.name.localeCompare(b.name);
  });

  for (const node of nodes) {
    if (node.children?.length) {
      sortTree(node.children);
    }
  }
}