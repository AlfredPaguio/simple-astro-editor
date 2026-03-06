import { MarkdownEditor } from "@/components/MarkdownEditor";
import { PreviewPane } from "@/components/PreviewPane";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PanelLeftClose,
  Maximize2,
  PanelRightClose,
  Minimize2,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Group as PanelGroup,
  Panel,
  Separator as PanelHandle,
  useDefaultLayout,
} from "react-resizable-panels";

interface Props {
  body: string;
  setBody: (value: string) => void;
}

export default function MainEditorPanels({ body, setBody }: Props) {
  // State for panel visibility (for toggle buttons)
  const [showEditor, setShowEditor] = useState<boolean>(true);
  const [showPreview, setShowPreview] = useState<boolean>(true);

  // Load persisted panel visibility from localStorage on mount
  useEffect(() => {
    const savedEditor = localStorage.getItem("panel-editor-visible");
    const savedPreview = localStorage.getItem("panel-preview-visible");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedEditor !== null) setShowEditor(savedEditor === "true");
    if (savedPreview !== null) setShowPreview(savedPreview === "true");
  }, []);

  const panelIds = [
    showEditor && "panel-editor",
    showPreview && "panel-preview",
  ].filter(Boolean) as string[];

  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: "panel-visible",
    panelIds: panelIds,
    storage: localStorage,
  });

  //   panel-editor
  // panel-preview

  //   // Save visibility changes to localStorage
  //   const handleCollapse = (key: string, collapsed: boolean) => {
  //     setShowPreview(!collapsed);
  //     localStorage.setItem(key, (!collapsed).toString());
  //   };

  return (
    <PanelGroup defaultLayout={defaultLayout} onLayoutChanged={onLayoutChanged}>
      <Panel id="panel-editor" minSize={50}>
        <Card className="overflow-hidden h-125 flex flex-col">
          <CardHeader className="bg-muted/30 py-3 px-4 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">Markdown</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                setShowEditor(false);
                localStorage.setItem("panel-editor-visible", "false");
              }}
            >
              <Minimize2 className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <div className="h-full">
              <MarkdownEditor value={body} onChange={setBody} />
            </div>
          </CardContent>
        </Card>
      </Panel>

      <PanelHandle />

      <Panel id="panel-preview" minSize={50}>
        <Card className="overflow-hidden h-125 flex flex-col">
          <CardHeader className="bg-muted/30 py-3 px-4 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">Preview</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => {
                setShowPreview(false);
                localStorage.setItem("panel-preview-visible", "false");
              }}
            >
              <Minimize2 className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <div className="h-full">
              <PreviewPane markdown={body} className="h-full border-0" />
            </div>
          </CardContent>
        </Card>
      </Panel>
    </PanelGroup>
  );
}
