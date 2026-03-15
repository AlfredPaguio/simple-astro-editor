import PanelControls from "@/_partials/PanelControls";
import { MarkdownEditor } from "@/components/MarkdownEditor";
import { PreviewPane } from "@/components/PreviewPane";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  PANEL_H_DEFAULT,
  ROW_HEIGHT,
  useEditorLayout,
} from "@/hooks/useEditorLayout";
import {
  Columns2,
  Eye,
  PanelLeftClose,
  PanelRightClose,
  SquareCode,
} from "lucide-react";
import { GridLayout, horizontalCompactor } from "react-grid-layout";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

interface Props {
  body: string;
  setBody: (value: string) => void;
}

export default function MainEditorPanels({ body, setBody }: Props) {
  const {
    viewMode,
    showEditor,
    showPreview,
    visibleLayout,
    cols,
    width,
    containerRef,
    mounted,
    switchViewMode,
    swapPanels,
    expandPanel,
    onLayoutChange,
  } = useEditorLayout();

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50 border w-fit self-center">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant={viewMode === "editor" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => switchViewMode("editor")}
                className="text-xs gap-1.5 h-7"
              >
                <SquareCode className="h-3.5 w-3.5" />
                Editor
              </Button>
            }
          />
          <TooltipContent>Editor only</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant={viewMode === "both" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => switchViewMode("both")}
                className="text-xs gap-1.5 h-7"
              >
                <Columns2 className="h-3.5 w-3.5" />
                Split
              </Button>
            }
          />
          <TooltipContent>Split view</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant={viewMode === "preview" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => switchViewMode("preview")}
                className="text-xs gap-1.5 h-7"
              >
                <Eye className="h-3.5 w-3.5" />
                Preview
              </Button>
            }
          />
          <TooltipContent>Preview only</TooltipContent>
        </Tooltip>
      </div>

      <div ref={containerRef} className="w-full">
        {mounted && visibleLayout.length > 0 && (
          <GridLayout
            width={width}
            layout={visibleLayout}
            gridConfig={{ cols, rowHeight: ROW_HEIGHT }}
            dragConfig={{ enabled: true, handle: ".drag-handle" }}
            resizeConfig={{
              enabled: true,
              handles: ["s", "w", "e", "n", "sw", "nw", "se", "ne"],
            }}
            compactor={horizontalCompactor}
            onLayoutChange={(newLayout) =>
              onLayoutChange(newLayout as typeof visibleLayout)
            }
            style={{ minHeight: `${PANEL_H_DEFAULT * ROW_HEIGHT + 16}px` }}
          >
            {showEditor && (
              <Card
                className="overflow-hidden flex flex-col gap-0"
                key="editor"
              >
                <CardHeader className="py-1.5 px-3 border-b drag-handle cursor-grab active:cursor-grabbing select-none shrink-0">
                  <div className="flex items-center gap-1">
                    <CardTitle className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground shrink-0">
                      <SquareCode className="h-3.5 w-3.5" />
                      Editor
                    </CardTitle>

                    <PanelControls
                      onExpand={(dir) => expandPanel("editor", dir)}
                      onSwap={swapPanels}
                    />

                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 shrink-0"
                            onClick={() => switchViewMode("preview")}
                          >
                            <PanelLeftClose className="h-3 w-3" />
                          </Button>
                        }
                      />
                      <TooltipContent>Hide editor</TooltipContent>
                    </Tooltip>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 min-h-0 overflow-hidden">
                  <MarkdownEditor
                    value={body}
                    onChange={setBody}
                    className="h-full"
                  />
                </CardContent>
              </Card>
            )}

            {showPreview && (
              <Card
                className="overflow-hidden flex flex-col gap-0"
                key="preview"
              >
                <CardHeader className="py-1.5 px-3 border-b drag-handle cursor-grab active:cursor-grabbing select-none shrink-0">
                  <div className="flex items-center gap-1">
                    <CardTitle className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground shrink-0">
                      <Eye className="h-3.5 w-3.5" />
                      Preview
                    </CardTitle>

                    <PanelControls
                      onExpand={(dir) => expandPanel("preview", dir)}
                      onSwap={swapPanels}
                    />

                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 shrink-0"
                            onClick={() => switchViewMode("editor")}
                          >
                            <PanelRightClose className="h-3 w-3" />
                          </Button>
                        }
                      />
                      <TooltipContent>Hide preview</TooltipContent>
                    </Tooltip>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 min-h-0 overflow-hidden pt-0">
                  <PreviewPane markdown={body} className="h-full border-0" />
                </CardContent>
              </Card>
            )}
          </GridLayout>
        )}

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
