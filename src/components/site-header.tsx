import { ModeToggle } from "@/components/mode-toggle";
import {
  SidebarManagerTrigger,
  useSidebarManager,
} from "@/components/sidebar-manager";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { FileEntry } from "@/lib/fs-access";
import {
  DownloadIcon,
  FileCode2,
  FolderOpen,
  PanelLeftIcon,
  PanelRightIcon,
  Save,
  Terminal,
} from "lucide-react";

interface Props {
  handleLoadConfig: () => void;
  handleLoadContentFolder: () => void;
  handleSave: () => void;
  handleDownload: () => void;
  loading: boolean;
  selectedFile?: FileEntry | null;
}

export default function SiteHeader({
  handleLoadConfig,
  handleDownload,
  handleLoadContentFolder,
  handleSave,
  selectedFile,
  loading = false,
}: Props) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 supports-backdrop-filter:backdrop-blur supports-backdrop-filter:bg-background/60 px-4">
      <div className="flex h-(--header-height) items-center gap-2">
        {/* <SidebarTrigger className="-ml-1" /> */}
        <SidebarManagerTrigger name="left">
          <PanelLeftIcon />
          <span className="sr-only">Toggle File and Collection Sidebar</span>
        </SidebarManagerTrigger>

        <Separator orientation="vertical" />

        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-primary" />
          <h1 className="text-base font-semibold tracking-tight">
            Astro Content Editor
          </h1>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadConfig}
                  disabled={loading}
                >
                  <FileCode2 className="h-4 w-4 mr-2" />
                  Config
                </Button>
              }
            />
            <TooltipContent>Load content.config.ts</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadContentFolder}
                  disabled={loading}
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Folder
                </Button>
              }
            />
            <TooltipContent>Open content folder</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" />

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSave}
                  disabled={!selectedFile || loading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              }
            />
            <TooltipContent>Save file to disk</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDownload}
                  disabled={loading}
                >
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Download
                </Button>
              }
            />
            <TooltipContent>Download as .md file</TooltipContent>
          </Tooltip>

          <ModeToggle />
        </div>

        <SidebarManagerTrigger name="right">
          <PanelRightIcon />
          <span className="sr-only">Toggle Frontmatter Sidebar</span>
        </SidebarManagerTrigger>
      </div>
    </header>
  );
}
