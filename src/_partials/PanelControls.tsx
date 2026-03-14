import {
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface PanelControlsProps {
  onMove: (dir: "left" | "right" | "up" | "down") => void;
  onResize: (dir: "left" | "right" | "up" | "down") => void;
}

export default function PanelControls({
  onMove,
  onResize,
}: PanelControlsProps) {
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
