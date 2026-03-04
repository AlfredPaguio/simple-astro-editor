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
  FileText,
  FolderOpen,
  Save,
  AlertCircle,
  DownloadIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

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
      alert("File saved successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save file");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    // if (!selectedFile) return;
    setLoading(true);
    try {
      const newContent = compileMarkdown(frontmatter, body);
      const blob = new Blob([newContent], { type: "text/markdown" });
      const blobURL = URL.createObjectURL(blob);
      const tempAnchor = document.createElement("a");
      tempAnchor.href = blobURL;
      // Use the existing file name or a default
      tempAnchor.download = selectedFile ? selectedFile.name : "document.md";

      // 4. Trigger the download
      document.body.appendChild(tempAnchor); // Required for Firefox
      tempAnchor.click();

      // 5. Clean up
      window.URL.revokeObjectURL(blobURL);
      document.body.removeChild(tempAnchor);

      alert("File downloaded successfully!");
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Astro MD Editor</h1>
            <div className="flex gap-2">
              <Button onClick={handleLoadConfig} disabled={loading}>
                <FileText className="size-4 mr-2" data-icon="inline-start" />
                Load Config
              </Button>
              <Button onClick={handleLoadContentFolder} disabled={loading}>
                <FolderOpen className="size-4 mr-2" data-icon="inline-start" />
                Open Content
              </Button>
              <Button onClick={handleSave} disabled={!selectedFile || loading}>
                <Save className="size-4 mr-2" data-icon="inline-start" />
                Save
              </Button>

              <Button onClick={handleDownload} disabled={loading}>
                <DownloadIcon
                  className="size-4 mr-2"
                  data-icon="inline-start"
                />
                Download
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2">
          <div className="container mx-auto flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">
              X
            </button>
          </div>
        </div>
      )}

      {/* FS API Warning */}
      {!fsSupported && (
        <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-2">
          <div className="container mx-auto text-yellow-800 text-sm">
            ⚠️ File System Access API not supported. Drag-and-drop fallback
            available.
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - File List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="border rounded-md p-4">
              <h2 className="font-semibold mb-3">Collections</h2>
              <NativeSelect
                value={selectedCollection}
                onChange={(e) => setSelectedCollection(e.target.value)}
                className="w-full border rounded-md p-2 text-sm"
              >
                {schemas.map((s) => (
                  <NativeSelectOption key={s.name} value={s.name}>
                    {s.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>

            <div className="border rounded-md p-4">
              <h2 className="font-semibold mb-3">Files ({files.length})</h2>
              <div className="space-y-1 max-h-96 overflow-auto">
                {files.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => handleOpenFile(file)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded text-sm hover:bg-accent",
                      selectedFile?.path === file.path && "bg-accent",
                    )}
                  >
                    {file.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Editor Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Frontmatter Form */}
            {currentSchema && (
              <div className="border rounded-md p-4">
                <h2 className="font-semibold mb-4">Frontmatter</h2>
                <SchemaForm
                  properties={currentSchema.jsonSchema.properties || {}}
                  values={frontmatter}
                  inferredFields={analysis.inferred}
                  unknownFields={analysis.unknown}
                  onChange={handleFrontmatterChange}
                />
              </div>
            )}

            {/* Split Editor + Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h2 className="font-semibold mb-2">Editor</h2>
                <MarkdownEditor value={body} onChange={setBody} />
              </div>
              <div>
                <h2 className="font-semibold mb-2">Preview</h2>
                <PreviewPane markdown={body} className="h-[600px]" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
