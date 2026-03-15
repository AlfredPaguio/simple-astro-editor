import { useState } from "react";
import {
  horizontalCompactor,
  useContainerWidth,
  useResponsiveLayout,
} from "react-grid-layout";

export type ViewMode = "both" | "editor" | "preview";

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

const BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const COLS = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };

export const ROW_HEIGHT = 40;
export const PANEL_H_DEFAULT = 14;
export const PANEL_H_MIN = 8;
export const PANEL_H_MAX = 24;
export const PANEL_W_STEP = 1;
export const PANEL_H_STEP = 2;

export function buildDefaultLayouts(showEditor: boolean, showPreview: boolean) {
  const makeLayouts = (editorW: number, previewW: number): LayoutItem[] => {
    const items: LayoutItem[] = [];
    if (showEditor)
      items.push({ i: "editor", x: 0, y: 0, w: editorW, h: PANEL_H_DEFAULT });
    if (showPreview)
      items.push({
        i: "preview",
        x: showEditor ? editorW : 0,
        y: 0,
        w: previewW,
        h: PANEL_H_DEFAULT,
      });
    return items;
  };

  const both = showEditor && showPreview;
  return {
    lg: makeLayouts(both ? 6 : 12, both ? 6 : 12),
    md: makeLayouts(both ? 5 : 10, both ? 5 : 10),
    sm: makeLayouts(both ? 3 : 6, both ? 3 : 6),
    xs: makeLayouts(both ? 2 : 4, both ? 2 : 4),
    xxs: makeLayouts(2, 2),
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

export function useEditorLayout() {
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

  const applyLayoutPatch = (
    patch: (item: LayoutItem, colCount: number) => Partial<LayoutItem>,
    panelKey: string,
  ) => {
    const colCount = cols;
    const updated = {
      ...layouts,
      [breakpoint]: layout.map((item) =>
        item.i === panelKey
          ? { ...item, ...patch(item as LayoutItem, colCount) }
          : item,
      ),
    };
    setLayouts(updated);
    saveToLS(updated);
  };

  const switchViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    const nextEditor = mode !== "preview";
    const nextPreview = mode !== "editor";
    const newLayouts = buildDefaultLayouts(nextEditor, nextPreview);
    setLayouts(newLayouts);
    saveToLS(newLayouts);
  };

  // Swap the x positions (and widths) of editor and preview at the current breakpoint.
  // If only one panel is visible, this is a no-op.
  const swapPanels = () => {
    const colCount = cols;
    const editor = layout.find((i) => i.i === "editor");
    const preview = layout.find((i) => i.i === "preview");
    if (!editor || !preview) return;

    const updated = {
      ...layouts,
      [breakpoint]: layout.map((item) => {
        if (item.i === "editor")
          return { ...item, x: preview.x, w: preview.w, y: preview.y };
        if (item.i === "preview")
          return { ...item, x: editor.x, w: editor.w, y: editor.y };
        return item;
      }),
    };
    // Clamp x so neither panel overflows after swap
    const clamped = {
      ...updated,
      [breakpoint]: (updated[breakpoint] as LayoutItem[]).map((item) => ({
        ...item,
        x: Math.min(item.x, colCount - item.w),
      })),
    };
    setLayouts(clamped);
    saveToLS(clamped);
  };

  // Expand a panel to fill all columns to its left or right,
  // shrinking the other panel to take the leftover space.
  const expandPanel = (panelKey: string, direction: "left" | "right") => {
    const colCount = cols;
    const thisPanel = layout.find((i) => i.i === panelKey) as
      | LayoutItem
      | undefined;
    const otherKey = panelKey === "editor" ? "preview" : "editor";
    const otherPanel = layout.find((i) => i.i === otherKey) as
      | LayoutItem
      | undefined;

    if (!thisPanel) return;

    // Solo panel — nothing to expand against
    if (!otherPanel) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      applyLayoutPatch((_item) => ({ x: 0, w: colCount }), panelKey);
      return;
    }

    const MIN_W = 0;

    let newThisX: number;
    let newThisW: number;
    // let newOtherX: number;
    // let newOtherW: number;

    if (direction === "right") {
      // Grow this panel rightward: push other panel to the right edge
      newThisX = thisPanel.x;
      newThisW = Math.min(colCount - thisPanel.x, colCount - MIN_W);
      // newOtherW = Math.max(MIN_W, colCount - newThisW - newThisX);
      // newOtherX = newThisX + newThisW;
    } else {
      // Grow this panel leftward: push other panel to the left edge
      newThisW = Math.min(colCount - otherPanel.x, colCount - MIN_W);
      newThisX = colCount - newThisW;
      // newOtherX = 0;
      // newOtherW = Math.max(MIN_W, newThisX);
    }

    const updated = {
      ...layouts,
      [breakpoint]: layout.map((item) => {
        if (item.i === panelKey) return { ...item, x: newThisX, w: newThisW };
        // if (item.i === otherKey) return { ...item, x: newOtherX, w: newOtherW };
        return item;
      }),
    };
    setLayouts(updated);
    saveToLS(updated);
  };

  const onLayoutChange = (newLayout: LayoutItem[]) => {
    const updated = { ...layouts, [breakpoint]: newLayout };
    setLayouts(updated);
    saveToLS(updated);
  };

  const visibleLayout = layout.filter(
    (item) =>
      (item.i === "editor" && showEditor) ||
      (item.i === "preview" && showPreview),
  );

  return {
    viewMode,
    showEditor,
    showPreview,
    layout,
    layouts,
    visibleLayout,
    breakpoint,
    cols,
    width,
    containerRef,
    mounted,
    switchViewMode,
    swapPanels,
    expandPanel,
    onLayoutChange,
  };
}
