import MainEditorPanels from "@/_partials/MainEditorPanels";
import { AppSidebar } from "@/components/app-sidebar";
import FileSystemAccessAlert from "@/components/FileSystemAccessAlert";
import { ModeToggle } from "@/components/mode-toggle";
import { SchemaForm } from "@/components/schema-form/SchemaForm";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { buildFileTree, sortTree } from "@/lib/file-tree-utils";
import { compileMarkdown, parseMarkdown } from "@/lib/frontmatter";
import {
  listMarkdownFiles,
  pickDirectory,
  pickFile,
  readFile,
  writeFile,
  type FileEntry,
} from "@/lib/fs-access";
import { analyzeFields } from "@/lib/inference";
import {
  evaluateConfigText,
  type CollectionSchema,
} from "@/lib/schema-evaluator";
import {
  AlertCircle,
  DownloadIcon,
  FileCode2,
  FilePlusCornerIcon,
  FileText,
  FolderOpen,
  Layers,
  Save,
  Terminal,
  X,
} from "lucide-react";
import { useId, useState } from "react";

export default function MainEditor() {
  const [schemas, setSchemas] = useState<CollectionSchema[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileEntry | null>(null);
  const [frontmatter, setFrontmatter] = useState<Record<string, unknown>>({});
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const schemaFormKey = useId();

  const handleLoadConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const file = await pickFile({
        "text/typescript": [".ts"],
        "text/javascript": [".js"],
      });
      if (!file) return;

      const text = await readFile(file.handle);
      const result = await evaluateConfigText(text);
      setSchemas(result);
      if (result.length > 0) setSelectedCollection(result[0].name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load config");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadContentFolder = async () => {
    setLoading(true);
    setError(null);
    try {
      const dir = await pickDirectory();
      if (!dir) return;

      const markdownFiles = await listMarkdownFiles(dir.handle);
      setFiles(markdownFiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load folder");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFile = async (file: FileEntry) => {
    setLoading(true);
    try {
      const text = await readFile(file.handle);
      const parsed = parseMarkdown(text);
      setFrontmatter(parsed.frontmatter);
      setBody(parsed.body);
      setSelectedFile(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open file");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      const newContent = compileMarkdown(frontmatter, body);
      await writeFile(selectedFile.handle, newContent);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save file");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const newContent = compileMarkdown(frontmatter, body);
      const blob = new Blob([newContent], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = selectedFile ? selectedFile.name : "document.md";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download file");
    } finally {
      setLoading(false);
    }
  };

  const handleFrontmatterChange = (key: string, value: unknown) => {
    setFrontmatter((prev) => ({ ...prev, [key]: value }));
  };

  const currentSchema = schemas.find((s) => s.name === selectedCollection);

  const analysis = analyzeFields(
    frontmatter,
    currentSchema?.jsonSchema?.properties ?? {},
  );

  const hasFrontmatterContent =
    Object.keys(frontmatter).length > 0 || currentSchema !== undefined;

  const fileTree = buildFileTree(files);
  sortTree(fileTree);

  return (
    <SidebarProvider>
      <AppSidebar
        collections={schemas}
        fileTree={fileTree}
        selectedCollection={selectedCollection}
        selectedFile={selectedFile}
        onSelectCollection={setSelectedCollection}
        onSelectFile={handleOpenFile}
      />

      <SidebarInset>
        <div className="flex flex-col h-screen bg-background">
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-4">
            <div className="flex h-14 items-center gap-2">
              <SidebarTrigger className="-ml-1" />
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
            </div>
          </header>

          {error && (
            <div className="px-4 pt-3">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription className="flex justify-between items-center w-full">
                  <span>{error}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-4 shrink-0"
                    onClick={() => setError(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}

          <FileSystemAccessAlert />

          <main className="flex-1 overflow-hidden flex flex-col lg:flex-row">
            <section className="flex-1 overflow-y-auto h-full pt-4 pb-6 px-4 md:px-6">
              <div className="space-y-5">
                {(selectedCollection || selectedFile) && (
                  <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 bg-muted/40 rounded-lg border">
                    {selectedCollection && (
                      <div className="flex items-center gap-2">
                        <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Collection
                        </span>
                        <Badge
                          variant="secondary"
                          className="font-mono text-xs font-medium"
                        >
                          {selectedCollection}
                        </Badge>
                      </div>
                    )}
                    {selectedCollection && selectedFile && (
                      <Separator orientation="vertical" className="h-4" />
                    )}
                    {selectedFile ? (
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          File
                        </span>
                        <Badge
                          variant="secondary"
                          className="font-mono text-xs font-medium"
                        >
                          {selectedFile.name}
                        </Badge>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <FilePlusCornerIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        <Badge variant="outline" className="font-mono text-xs">
                          New File
                        </Badge>
                      </div>
                    )}
                  </div>
                )}

                {hasFrontmatterContent && (
                  <Accordion defaultValue={["frontmatter"]}>
                    <AccordionItem
                      value="frontmatter"
                      className="border rounded-lg"
                    >
                      <AccordionTrigger className="px-4 py-3 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <FileCode2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            Frontmatter
                          </span>
                          {currentSchema ? (
                            <Badge
                              variant="secondary"
                              className="text-xs font-normal ml-1"
                            >
                              {analysis.known.length} fields
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-xs font-normal ml-1 border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400"
                            >
                              inferred only
                            </Badge>
                          )}
                          {analysis.inferred.length > 0 && currentSchema && (
                            <Badge
                              variant="outline"
                              className="text-xs font-normal border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400"
                            >
                              {analysis.inferred.length} inferred
                            </Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <SchemaForm
                          key={schemaFormKey}
                          properties={currentSchema?.jsonSchema.properties || {}}
                          values={frontmatter}
                          inferredFields={analysis.inferred}
                          unknownFields={analysis.unknown}
                          onChange={handleFrontmatterChange}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}

                <div className="space-y-4">
                  <MainEditorPanels body={body} setBody={setBody} />
                </div>
              </div>
            </section>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
