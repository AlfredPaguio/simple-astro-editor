import { ArrowLeftRight, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PanelControlsProps {
  /** Expand this panel to fill all space in the given direction */
  onExpand: (dir: "left" | "right") => void;
  /** Swap positions with the other panel */
  onSwap: () => void;
}

export default function PanelControls({
  onExpand,
  onSwap,
}: PanelControlsProps) {
  return (
    <div className="flex items-center gap-0.5 flex-1 justify-center">
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-muted-foreground hover:text-foreground"
              onClick={() => onExpand("left")}
            >
              <ChevronLeft className="h-2.5 w-2.5" />
            </Button>
          }
        />
        <TooltipContent side="bottom">Expand left</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-3" />

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-muted-foreground hover:text-foreground"
              onClick={onSwap}
            >
              <ArrowLeftRight className="h-2.5 w-2.5" />
            </Button>
          }
        />
        <TooltipContent side="bottom">Swap panels</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-3" />

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-muted-foreground hover:text-foreground"
              onClick={() => onExpand("right")}
            >
              <ChevronRight className="h-2.5 w-2.5" />
            </Button>
          }
        />
        <TooltipContent side="bottom">Expand right</TooltipContent>
      </Tooltip>
    </div>
  );
}
