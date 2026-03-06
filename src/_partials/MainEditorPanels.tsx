import { MarkdownEditor } from "@/components/MarkdownEditor";
import { PreviewPane } from "@/components/PreviewPane";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    Columns2,
    Eye,
    PanelLeftClose,
    PanelRightClose,
    RotateCcwIcon as ResetIcon,
    SquareCode,
} from "lucide-react";
import { GridLayout, horizontalCompactor } from "react-grid-layout";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

interface Props {
  body: string;
  setBody: (value: string) => void;
}

interface PanelControlsProps {
  onMove: (dir: "left" | "right" | "up" | "down") => void;
  onResize: (dir: "left" | "right" | "up" | "down") => void;
}

function PanelControls({ onMove, onResize }: PanelControlsProps) {
  return (
    <div className="flex items-center gap-0.5 flex-1 justify-center">
      <div className="flex items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-muted-foreground hover:text-foreground"
                onClick={() => onMove("up")}
              >
                <ArrowUp className="h-2.5 w-2.5" />
              </Button>
            }
          />
          <TooltipContent side="bottom">Move up</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-muted-foreground hover:text-foreground"
                onClick={() => onMove("down")}
              >
                <ArrowDown className="h-2.5 w-2.5" />
              </Button>
            }
          />
          <TooltipContent side="bottom">Move down</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-muted-foreground hover:text-foreground"
                onClick={() => onMove("left")}
              >
                <ArrowLeft className="h-2.5 w-2.5" />
              </Button>
            }
          />
          <TooltipContent side="bottom">Move left</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-muted-foreground hover:text-foreground"
                onClick={() => onMove("right")}
              >
                <ArrowRight className="h-2.5 w-2.5" />
              </Button>
            }
          />
          <TooltipContent side="bottom">Move right</TooltipContent>
        </Tooltip>
      </div>

      <Separator orientation="vertical" className="h-3 mx-1" />

      <div className="flex items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-muted-foreground hover:text-foreground"
                onClick={() => onResize("up")}
              >
                <ChevronUp className="h-2.5 w-2.5" />
              </Button>
            }
          />
          <TooltipContent side="bottom">Shrink height</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-muted-foreground hover:text-foreground"
                onClick={() => onResize("down")}
              >
                <ChevronDown className="h-2.5 w-2.5" />
              </Button>
            }
          />
          <TooltipContent side="bottom">Expand height</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-muted-foreground hover:text-foreground"
                onClick={() => onResize("left")}
              >
                <ChevronLeft className="h-2.5 w-2.5" />
              </Button>
            }
          />
          <TooltipContent side="bottom">Shrink width</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-muted-foreground hover:text-foreground"
                onClick={() => onResize("right")}
              >
                <ChevronRight className="h-2.5 w-2.5" />
              </Button>
            }
          />
          <TooltipContent side="bottom">Expand width</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
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
    resetView,
    movePanel,
    resizePanel,
    onLayoutChange,
  } = useEditorLayout();

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50 border w-fit">
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

        <Separator orientation="vertical" className="h-4 mx-1" />

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                onClick={resetView}
                className="text-xs gap-1.5 h-7"
              >
                <ResetIcon className="h-3.5 w-3.5" />
                Reset
              </Button>
            }
          />
          <TooltipContent>Reset panels to default</TooltipContent>
        </Tooltip>
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
            onLayoutChange={(newLayout) =>
              onLayoutChange(newLayout as typeof visibleLayout)
            }
            style={{ minHeight: `${PANEL_H_DEFAULT * ROW_HEIGHT + 16}px` }}
          >
            {showEditor && (
              <Card className="overflow-hidden flex flex-col" key="editor">
                <CardHeader className="py-1.5 px-3 border-b drag-handle cursor-grab active:cursor-grabbing select-none shrink-0">
                  <div className="flex items-center gap-1">
                    <CardTitle className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground shrink-0">
                      <SquareCode className="h-3.5 w-3.5" />
                      Editor
                    </CardTitle>

                    <PanelControls
                      onMove={(dir) => movePanel("editor", dir)}
                      onResize={(dir) => resizePanel("editor", dir)}
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
              <Card className="overflow-hidden flex flex-col" key="preview">
                <CardHeader className="py-1.5 px-3 border-b drag-handle cursor-grab active:cursor-grabbing select-none shrink-0">
                  <div className="flex items-center gap-1">
                    <CardTitle className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground shrink-0">
                      <Eye className="h-3.5 w-3.5" />
                      Preview
                    </CardTitle>

                    <PanelControls
                      onMove={(dir) => movePanel("preview", dir)}
                      onResize={(dir) => resizePanel("preview", dir)}
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
                <CardContent className="p-0 flex-1 min-h-0 overflow-hidden">
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
