import * as React from "react";
import { ChevronRight, FileText, Folder, Layers } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import type { FileEntry } from "@/lib/fs-access";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { TreeNode } from "@/lib/file-tree-utils";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

type FileItem = FileEntry;

interface CollectionItem {
  name: string;
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  collections: CollectionItem[];
  fileTree: TreeNode[];
  selectedCollection?: string;
  selectedFile?: FileItem | null;
  onSelectCollection: (name: string) => void;
  onSelectFile: (file: FileItem) => void;
}

export function AppSidebar({
  collections,
  fileTree,
  selectedCollection,
  selectedFile,
  onSelectCollection,
  onSelectFile,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar {...props}>
      <SidebarContent>
        {/* 1. Collections Group */}
        <SidebarGroup>
          <SidebarGroupLabel>Collections</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {collections.length > 0 ? (
                collections.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      isActive={selectedCollection === item.name}
                      onClick={() => onSelectCollection(item.name)}
                      className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                    >
                      <Layers className="h-4 w-4" />
                      <span>{item.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              ) : (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <span className="text-xs text-muted-foreground">
                      No config loaded
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              <span className="p-4">Or Select</span>
              {collections.length > 0 ? (
                <NativeSelect
                  value={selectedCollection}
                  onChange={(e) => onSelectCollection(e.target.value)}
                  className="w-full text-sm"
                >
                  {collections.map((s) => (
                    <NativeSelectOption key={s.name} value={s.name}>
                      {s.name}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No config loaded
                </p>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* 2. Files Group (Tree) */}
        <SidebarGroup>
          <SidebarGroupLabel>Files</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {fileTree.length > 0 ? (
                fileTree.map((node) => (
                  <TreeItem
                    key={node.path}
                    item={node}
                    selectedFile={selectedFile}
                    onSelectFile={onSelectFile}
                  />
                ))
              ) : (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <span className="text-xs text-muted-foreground">
                      Open a folder
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

// Recursive Tree Component
function TreeItem({
  item,
  selectedFile,
  onSelectFile,
}: {
  item: TreeNode;
  selectedFile?: FileEntry | null;
  onSelectFile: (file: FileEntry) => void;
}) {
  const { setOpen, setOpenMobile, isMobile } = useSidebar();

  const handleSelect = (file: FileEntry) => {
    onSelectFile(file);

    // close sidebar after selection
    if (isMobile) {
      setOpenMobile(false);
    } else {
      setOpen(false);
    }
  };

  if (item.isFile) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={selectedFile?.path === item.path}
          onClick={() => item.fileHandle && handleSelect(item.fileHandle)}
          className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary justify-start"
        >
          <FileText className="h-4 w-4" />
          <span className="truncate">{item.name}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  // Folder
  return (
    <SidebarMenuItem>
      <Collapsible
        className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
        defaultOpen={false}
      >
        <CollapsibleTrigger
          render={
            <SidebarMenuButton>
              <ChevronRight className="transition-transform" />
              <Folder className="h-4 w-4" />
              <span>{item.name}</span>
            </SidebarMenuButton>
          }
        />
        <CollapsibleContent
          render={
            <SidebarMenuSub>
              {item.children?.map((child) => (
                <TreeItem
                  key={child.path}
                  item={child}
                  selectedFile={selectedFile}
                  onSelectFile={onSelectFile}
                />
              ))}
            </SidebarMenuSub>
          }
        />
      </Collapsible>
    </SidebarMenuItem>
  );
}
