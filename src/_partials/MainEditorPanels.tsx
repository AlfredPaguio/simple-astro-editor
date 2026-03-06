import { MarkdownEditor } from "@/components/MarkdownEditor";
import { PreviewPane } from "@/components/PreviewPane";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Columns2,
  Eye,
  PanelLeftClose,
  PanelRightClose,
  RotateCcwIcon as ResetIcon,
  SquareCode,
} from "lucide-react";
import { useState } from "react";
import {
  GridLayout,
  horizontalCompactor,
  useContainerWidth,
  useResponsiveLayout,
} from "react-grid-layout";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

interface Props {
  body: string;
  setBody: (value: string) => void;
}

// Layout helpers
const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const COLS = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };
const ROW_HEIGHT = 40;
const PANEL_H = 14; // rows tall

type ViewMode = "both" | "editor" | "preview";

export default function MainEditorPanels({ body, setBody }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("both");
  const showEditor = viewMode !== "preview";
  const showPreview = viewMode !== "editor";

  const savedLayouts = getFromLS();
  const hasValidSavedLayouts =
    savedLayouts &&
    Object.keys(savedLayouts).length > 0 &&
    (savedLayouts as { lg?: unknown[] }).lg?.length;

  const initialLayouts = hasValidSavedLayouts
    ? (savedLayouts as Parameters<typeof useResponsiveLayout>[0]["layouts"])
    : buildDefaultLayouts(showEditor, showPreview);

  const { width, containerRef, mounted } = useContainerWidth({
    initialWidth: 1280,
  });

  const { layout, layouts, breakpoint, cols, setLayouts } = useResponsiveLayout(
    {
      width,
      breakpoints: BREAKPOINTS,
      cols: COLS,
      layouts: initialLayouts,
      compactor: horizontalCompactor,
      onLayoutChange: (_layout, allLayouts) => {
        saveToLS(allLayouts);
      },
    },
  );

  /** When the user switches view mode, rebuild layouts so panels fill the space */
  const switchViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    const nextEditor = mode !== "preview";
    const nextPreview = mode !== "editor";
    const newLayouts = buildDefaultLayouts(nextEditor, nextPreview);
    setLayouts(newLayouts);
    saveToLS(newLayouts);
  };

  const resetViewMode = () => {
    setViewMode("both");
    const newLayouts = buildDefaultLayouts(true, true);
    setLayouts(newLayouts);
    saveToLS(newLayouts);
  };

  // Only render the items that are currently visible
  const visibleLayout = layout.filter(
    (item) =>
      (item.i === "editor" && showEditor) ||
      (item.i === "preview" && showPreview),
  );

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50 border w-fit">
        <Button
          variant={viewMode === "editor" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => switchViewMode("editor")}
          className="text-xs gap-1.5 h-7"
          title="Editor only"
        >
          <SquareCode className="h-3.5 w-3.5" />
          Editor
        </Button>
        <Button
          variant={viewMode === "both" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => switchViewMode("both")}
          className="text-xs gap-1.5 h-7"
          title="Split view"
        >
          <Columns2 className="h-3.5 w-3.5" />
          Split
        </Button>
        <Button
          variant={viewMode === "preview" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => switchViewMode("preview")}
          className="text-xs gap-1.5 h-7"
          title="Preview only"
        >
          <Eye className="h-3.5 w-3.5" data-icon="inline-start" />
          Preview
        </Button>

        <Button
          variant={"ghost"}
          size="sm"
          onClick={() => resetViewMode()}
          className="text-xs gap-1.5 h-7"
          title="Reset View"
        >
          <ResetIcon className="h-3.5 w-3.5" data-icon="inline-start" />
          Reset View
        </Button>
      </div>

      <div ref={containerRef} className="w-full">
        {mounted && visibleLayout.length > 0 && (
          <GridLayout
            width={width}
            layout={visibleLayout}
            gridConfig={{ cols, rowHeight: ROW_HEIGHT }}
            dragConfig={{ enabled: true, handle: ".drag-handle" }}
            resizeConfig={{ enabled: true, handles: ["se", "e", "s"] }}
            compactor={horizontalCompactor}
            onLayoutChange={(newLayout) => {
              const updated = {
                ...layouts,
                [breakpoint]: newLayout,
              };
              setLayouts(updated);
              saveToLS(updated);
            }}
            style={{ minHeight: `${PANEL_H * ROW_HEIGHT + 16}px` }}
          >
            {/* Editor panel */}
            {showEditor && (
              <Card className="overflow-hidden flex flex-col" key="editor">
                <CardHeader className="py-2 px-3 border-b drag-handle cursor-grab active:cursor-grabbing select-none">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-1.5">
                      <SquareCode className="h-3.5 w-3.5 text-muted-foreground" />
                      Markdown Editor
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => switchViewMode("preview")}
                      title="Hide editor"
                    >
                      <PanelLeftClose className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-hidden">
                  <div className="h-full">
                    <MarkdownEditor value={body} onChange={setBody} />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Preview panel */}
            {showPreview && (
              <Card className="overflow-hidden flex flex-col" key="preview">
                <CardHeader className="py-2 px-3 border-b drag-handle cursor-grab active:cursor-grabbing select-none">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                      Preview
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => switchViewMode("editor")}
                      title="Hide preview"
                    >
                      <PanelRightClose className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-hidden">
                  <PreviewPane markdown={body} className="h-full border-0" />
                </CardContent>
              </Card>
            )}
          </GridLayout>
        )}

        {/* Empty state */}
        {!showEditor && !showPreview && (
          <Card className="p-8 text-center text-muted-foreground">
            <p className="font-medium">All panels hidden</p>
            <p className="text-sm mt-1">
              Use the toolbar above to show a panel.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => switchViewMode("both")}
            >
              <Columns2 className="h-3.5 w-3.5 mr-1.5" />
              Show both panels
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}

/** Build default layouts for a given visibility state */
function buildDefaultLayouts(showEditor: boolean, showPreview: boolean) {
  type LayoutItem = { i: string; x: number; y: number; w: number; h: number };
  const makeLayouts = (
    editorW: number,
    previewW: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _totalCols: number,
  ) => {
    const items: LayoutItem[] = [];
    if (showEditor)
      items.push({ i: "editor", x: 0, y: 0, w: editorW, h: PANEL_H });
    if (showPreview)
      items.push({
        i: "preview",
        x: showEditor ? editorW : 0,
        y: 0,
        w: previewW,
        h: PANEL_H,
      });
    return items;
  };

  const both = showEditor && showPreview;
  return {
    lg: makeLayouts(both ? 6 : 12, both ? 6 : 12, 12),
    md: makeLayouts(both ? 5 : 10, both ? 5 : 10, 10),
    sm: makeLayouts(both ? 3 : 6, both ? 3 : 6, 6),
    xs: makeLayouts(both ? 2 : 4, both ? 2 : 4, 4),
    xxs: makeLayouts(2, 2, 2),
  };
}

function getFromLS(): Record<string, unknown> | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return JSON.parse(localStorage.getItem("panel-layout") || "{}") as Record<
      string,
      unknown
    >;
  } catch {
    return undefined;
  }
}

function saveToLS(allLayouts: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem("panel-layout", JSON.stringify(allLayouts));
}
