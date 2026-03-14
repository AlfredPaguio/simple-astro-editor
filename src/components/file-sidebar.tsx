import {
  ChevronRight,
  FilesIcon,
  FileText,
  Folder,
  FolderOpenIcon,
  Layers,
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { InputGroupAddon } from "@/components/ui/input-group";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import type { TreeNode } from "@/lib/file-tree-utils";
import type { FileEntry } from "@/lib/fs-access";
import { useState, type ComponentProps } from "react";

type FileItem = FileEntry;

interface CollectionItem {
  name: string;
}

interface FileSidebarProps extends ComponentProps<typeof Sidebar> {
  collections: CollectionItem[];
  fileTree: TreeNode[];
  selectedCollection?: string;
  selectedFile?: FileItem | null;
  onSelectCollection: (name: string) => void;
  onSelectFile: (file: FileItem) => void;
}

export function FileSidebar({
  collections,
  fileTree,
  selectedCollection,
  selectedFile,
  onSelectCollection,
  onSelectFile,
  ...props
}: FileSidebarProps) {
  return (
    <Sidebar
      side="left"
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      variant="inset"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex w-full items-center gap-2 p-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <FilesIcon className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Files</span>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* 1. Collections Group */}
        <SidebarGroup>
          <SidebarGroupLabel>Collections</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {collections.length > 0 &&
                collections.length < 5 &&
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
                ))}

              {collections.length > 0 && collections.length >= 5 && (
                <Combobox
                  items={collections}
                  itemToStringValue={(collection: CollectionItem) =>
                    collection.name
                  }
                  autoHighlight
                >
                  <ComboboxInput placeholder="Select a collection" showClear>
                    <InputGroupAddon>
                      <Layers />
                    </InputGroupAddon>
                  </ComboboxInput>
                  <ComboboxContent alignOffset={-28} className="w-60">
                    <ComboboxEmpty>No Collections found.</ComboboxEmpty>
                    <ComboboxList>
                      {(collection) => (
                        <ComboboxItem
                          key={collection.name}
                          value={collection.name}
                        >
                          {collection.name}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              )}

              {collections.length <= 0 && (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <span className="text-muted-foreground">
                      No config loaded
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* 2. Files Group (Tree) */}
        <SidebarGroup>
          <SidebarGroupLabel>Files</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
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
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);

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
        open={isCollapsibleOpen}
        onOpenChange={setIsCollapsibleOpen}
      >
        <CollapsibleTrigger
          render={
            <SidebarMenuButton>
              <ChevronRight className="transition-transform" />
              {!isCollapsibleOpen ? (
                <Folder className="size-4" />
              ) : (
                <FolderOpenIcon className="size-4" />
              )}
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
