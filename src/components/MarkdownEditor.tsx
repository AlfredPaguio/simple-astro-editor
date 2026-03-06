import { cn } from "@/lib/utils";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import CodeMirror from "@uiw/react-codemirror";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  className,
}: MarkdownEditorProps) {
  return (
    <div className={cn("h-full overflow-hidden", className)}>
      <CodeMirror
        value={value}
        height="100%"
        theme={oneDark}
        extensions={[markdown()]}
        onChange={(v) => onChange(v)}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          foldGutter: true,
        }}
        className="h-full text-sm [&_.cm-editor]:h-full [&_.cm-scroller]:h-full"
      />
    </div>
  );
}
