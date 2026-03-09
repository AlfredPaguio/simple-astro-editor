import { cn } from "@/lib/utils";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import CodeMirror from "@uiw/react-codemirror";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

// Defined outside the component — these are created once for the lifetime of
// the app. If they were inside the component, every render would produce a new
// array/extension instance, causing CodeMirror to tear down and rebuild its
// entire editor state on every keystroke.
const EXTENSIONS = [markdown()];
const BASIC_SETUP = {
  lineNumbers: true,
  highlightActiveLine: true,
  foldGutter: true,
};

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
        extensions={EXTENSIONS}
        onChange={(v) => onChange(v)}
        basicSetup={BASIC_SETUP}
        className="h-full text-sm [&_.cm-editor]:h-full [&_.cm-scroller]:h-full"
      />
    </div>
  );
}
