import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import { cn } from "@/lib/utils";

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
    <div className={cn("border rounded-md overflow-hidden", className)}>
      <CodeMirror
        value={value}
        height="600px"
        theme={oneDark}
        extensions={[markdown()]}
        onChange={(v) => onChange(v)}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          foldGutter: true,
        }}
        className="text-sm"
      />
    </div>
  );
}
