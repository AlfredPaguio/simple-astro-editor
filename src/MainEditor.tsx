import { MarkdownEditor } from "@/components/MarkdownEditor";
import { PreviewPane } from "@/components/PreviewPane";
import { SchemaForm } from "@/components/SchemaForm";
import { compileMarkdown, parseMarkdown } from "@/lib/frontmatter";
import {
  isFileSystemAccessSupported,
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
  initializeEsbuild,
  type CollectionSchema,
} from "@/lib/schema-evaluator";
import { useEffect, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Icons
import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { buildFileTree, sortTree } from "@/lib/file-tree-utils";
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
import { useId } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function MainEditor() {
  const [schemas, setSchemas] = useState<CollectionSchema[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileEntry | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [frontmatter, setFrontmatter] = useState<Record<string, any>>({});
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fsSupported, setFsSupported] = useState(true);
  const schemaFormKey = useId();

  useEffect(() => {
    setFsSupported(isFileSystemAccessSupported());
    initializeEsbuild();
  }, []);

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
      if (result.length > 0) {
        setSelectedCollection(result[0].name);
      }
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
      // You could replace this with a Toast notification from shadcn
      alert("File saved successfully!");
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFrontmatterChange = (key: string, value: any) => {
    setFrontmatter((prev) => ({ ...prev, [key]: value }));
  };

  const currentSchema = schemas.find((s) => s.name === selectedCollection);
  const analysis = currentSchema
    ? analyzeFields(frontmatter, currentSchema.jsonSchema.properties || {})
    : { known: [], inferred: [], unknown: [] };

  const fileTree = buildFileTree(files);
  // then we sort after finishing file tree
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
          {/* Top Navigation */}
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-4">
            <div className="flex h-14 items-center">
              <SidebarTrigger className="-ml-1 mr-2" />
              <Separator orientation="vertical" className="mr-2" />
              <div className="flex items-center gap-2 mr-4">
                <Terminal className="h-6 w-6" />
                <h1 className="text-lg font-semibold tracking-tight">
                  Astro Content Editor
                </h1>
              </div>

              <div className="flex flex-1 items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadConfig}
                  disabled={loading}
                >
                  <FileCode2 className="h-4 w-4 mr-2" />
                  Config
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadContentFolder}
                  disabled={loading}
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Folder
                </Button>

                <Separator orientation="vertical" className="h-6 mx-2" />

                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSave}
                  disabled={!selectedFile || loading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDownload}
                  disabled={loading}
                >
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <ModeToggle />
              </div>
            </div>
          </header>

          {/* Error / Warning Banners */}
          {error && (
            <div className="container pt-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription className="flex justify-between items-center w-full">
                  {error}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setError(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {!fsSupported && (
            <div className="container pt-4">
              <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Browser Support Notice</AlertTitle>
                <AlertDescription>
                  File System Access API not supported. Drag-and-drop fallback
                  is available.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <main className="flex-1 overflow-hidden flex flex-col lg:flex-row">
            {/* Main Content Area */}
            <section className="flex-1 overflow-y-auto h-full pt-4 pb-6 px-4 md:px-6">
              <div className="max-w-5xl mx-auto space-y-6">
                {(selectedCollection || selectedFile) && (
                  <div className="flex flex-wrap items-center gap-4 px-4 py-3 bg-muted/50 rounded-lg border">
                    {selectedCollection && (
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Collection:
                        </span>
                        <span className="font-mono text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                          {selectedCollection}
                        </span>
                      </div>
                    )}
                    {selectedFile ? (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          File:
                        </span>
                        <span className="font-mono text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                          {selectedFile.name}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <FilePlusCornerIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                          New File
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Frontmatter Section */}
                {currentSchema && (
                  <Accordion defaultValue={["frontmatter"]}>
                    <AccordionItem
                      value="frontmatter"
                      className="border rounded-lg"
                    >
                      <AccordionTrigger className="px-4 py-3 hover:no-underline">
                        <div className="flex items-center gap-2">
                          <FileCode2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-base font-medium">
                            Frontmatter
                          </span>
                          <span className="text-xs text-muted-foreground font-normal">
                            ({analysis.known.length} Known fields)
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <SchemaForm
                          key={schemaFormKey}
                          properties={currentSchema.jsonSchema.properties || {}}
                          values={frontmatter}
                          inferredFields={analysis.inferred}
                          unknownFields={analysis.unknown}
                          onChange={handleFrontmatterChange}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}

                {/* Markdown Editor Section */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <Card className="overflow-hidden">
                    <CardHeader>
                      <CardTitle className="text-base font-medium">
                        Markdown
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="h-125">
                        <MarkdownEditor value={body} onChange={setBody} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="overflow-hidden">
                    <CardHeader>
                      <CardTitle className="text-base font-medium">
                        Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="h-125">
                        <PreviewPane
                          markdown={body}
                          className="h-full border-0"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
