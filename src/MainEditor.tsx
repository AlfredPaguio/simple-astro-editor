import MainEditorPanels from "@/_partials/MainEditorPanels";
import { FileSidebar } from "@/components/file-sidebar";
import FileSystemAccessAlert from "@/components/FileSystemAccessAlert";
import { FrontmatterSidebar } from "@/components/frontmatter-sidebar";
import {
  SidebarManager,
  SidebarManagerProvider,
} from "@/components/sidebar-manager";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
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
  FilePlusCornerIcon,
  FileText,
  Layers,
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

  const fileTree = buildFileTree(files);
  sortTree(fileTree);

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarManagerProvider>
        <SidebarProvider className="flex flex-col" defaultOpen={true}>
          <SiteHeader
            handleDownload={handleDownload}
            handleLoadConfig={handleLoadConfig}
            handleLoadContentFolder={handleLoadContentFolder}
            handleSave={handleSave}
            loading={loading}
            selectedFile={selectedFile}
          />

          <SidebarManager name="left">
            <FileSidebar
              collections={schemas}
              fileTree={fileTree}
              selectedCollection={selectedCollection}
              selectedFile={selectedFile}
              onSelectCollection={setSelectedCollection}
              onSelectFile={handleOpenFile}
            />
          </SidebarManager>

          <SidebarInset>
            <main className="flex-1 overflow-hidden flex flex-col lg:flex-row">
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
                          <Badge
                            variant="outline"
                            className="font-mono text-xs"
                          >
                            New File
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-4">
                    <MainEditorPanels body={body} setBody={setBody} />
                  </div>
                </div>
              </section>
            </main>
          </SidebarInset>
          {/* for frontmatter sidebar */}
          <SidebarProvider
            style={
              {
                "--sidebar-width": "100svh",
                "--sidebar-width-mobile": "100vw",
              } as React.CSSProperties
            }
          >
            <SidebarManager name="right">
              <FrontmatterSidebar
                currentSchema={currentSchema}
                frontmatter={frontmatter}
                inferredFields={analysis.inferred}
                unknownFields={analysis.unknown}
                schemaFormKey={schemaFormKey}
                onFieldChange={handleFrontmatterChange}
              />
            </SidebarManager>
          </SidebarProvider>
        </SidebarProvider>
        <SiteFooter />
      </SidebarManagerProvider>
    </div>
  );
}
