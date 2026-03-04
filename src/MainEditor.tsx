/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  initializeEsbuild,
  evaluateConfigText,
  type CollectionSchema,
} from "@/lib/schema-evaluator";
import {
  pickFile,
  pickDirectory,
  readFile,
  writeFile,
  listMarkdownFiles,
  isFileSystemAccessSupported,
  type FileHandle,
} from "@/lib/fs-access";
import { parseMarkdown, compileMarkdown } from "@/lib/frontmatter";
import { analyzeFields } from "@/lib/inference";
import { SchemaForm } from "@/components/SchemaForm";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { PreviewPane } from "@/components/PreviewPane";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

// Icons
import {
  FileText,
  FolderOpen,
  Save,
  AlertCircle,
  DownloadIcon,
  FileCode2,
  Terminal,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useId } from "react";
import { ModeToggle } from "@/components/mode-toggle";

export default function MainEditor() {
  const [schemas, setSchemas] = useState<CollectionSchema[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const [files, setFiles] = useState<FileHandle[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileHandle | null>(null);
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

  const handleOpenFile = async (file: FileHandle) => {
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

  const handleFrontmatterChange = (key: string, value: any) => {
    setFrontmatter((prev) => ({ ...prev, [key]: value }));
  };

  const currentSchema = schemas.find((s) => s.name === selectedCollection);
  const analysis = currentSchema
    ? analyzeFields(frontmatter, currentSchema.jsonSchema.properties || {})
    : { known: [], inferred: [], unknown: [] };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-4">
        <div className="flex h-14 items-center">
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
              File System Access API not supported. Drag-and-drop fallback is
              available.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Application Shell */}
      <main className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full lg:w-72 border-r bg-muted/40 shrink-0 lg:flex lg:flex-col hidden">
          <ScrollArea className="flex-1 h-full">
            <div className="p-4 space-y-6">
              {/* Collections Selector */}
              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Collections
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {schemas.length > 0 ? (
                    <NativeSelect
                      value={selectedCollection}
                      onChange={(e) => setSelectedCollection(e.target.value)}
                      className="w-full text-sm"
                    >
                      {schemas.map((s) => (
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
                </CardContent>
              </Card>

              <Separator />

              {/* File List */}
              <Card className="border-0 shadow-none bg-transparent">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Files ({files.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {files.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">
                        Open a folder to list files
                      </p>
                    )}
                    {files.map((file) => (
                      <Button
                        key={file.path}
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "w-full justify-start font-normal text-left h-8 px-2",
                          selectedFile?.path === file.path &&
                            "bg-primary/10 text-primary hover:bg-primary/15",
                        )}
                        onClick={() => handleOpenFile(file)}
                      >
                        <FileText className="h-3.5 w-3.5 mr-2 opacity-70" />
                        <span className="truncate">{file.name}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content Area */}
        <section className="flex-1 overflow-y-auto h-full pt-4 pb-6 px-4 md:px-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Frontmatter Section */}
            {currentSchema && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Frontmatter</CardTitle>
                  <CardDescription>
                    Editing metadata for collection:{" "}
                    <span className="font-mono text-xs text-primary">
                      {selectedCollection}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SchemaForm
                    key={schemaFormKey}
                    properties={currentSchema.jsonSchema.properties || {}}
                    values={frontmatter}
                    inferredFields={analysis.inferred}
                    unknownFields={analysis.unknown}
                    onChange={handleFrontmatterChange}
                  />
                </CardContent>
              </Card>
            )}

            {/* Markdown Editor Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card className="overflow-hidden">
                <CardHeader className="bg-muted/50 py-3 px-4 border-b">
                  <CardTitle className="text-base font-medium">
                    Markdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Adjust height as needed */}
                  <div className="h-[500px]">
                    <MarkdownEditor value={body} onChange={setBody} />
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <CardHeader className="bg-muted/50 py-3 px-4 border-b">
                  <CardTitle className="text-base font-medium">
                    Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[500px]">
                    <PreviewPane markdown={body} className="h-full border-0" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
