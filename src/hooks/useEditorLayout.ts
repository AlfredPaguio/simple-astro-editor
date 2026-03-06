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

  const resetView = () => {
    setViewMode("both");
    const newLayouts = buildDefaultLayouts(true, true);
    setLayouts(newLayouts);
    saveToLS(newLayouts);
  };

  const movePanel = (
    panelKey: string,
    direction: "left" | "right" | "up" | "down",
  ) => {
    applyLayoutPatch((item, colCount) => {
      switch (direction) {
        case "left":
          return { x: Math.max(0, item.x - 1) };
        case "right":
          return { x: Math.min(colCount - item.w, item.x + 1) };
        case "up":
          return { y: Math.max(0, item.y - 1) };
        case "down":
          return { y: item.y + 1 };
      }
    }, panelKey);
  };

  const resizePanel = (
    panelKey: string,
    direction: "left" | "right" | "up" | "down",
  ) => {
    applyLayoutPatch((item, colCount) => {
      switch (direction) {
        case "right":
          return { w: Math.min(colCount - item.x, item.w + PANEL_W_STEP) };
        case "left":
          return { w: Math.max(2, item.w - PANEL_W_STEP) };
        case "down":
          return { h: Math.min(PANEL_H_MAX, item.h + PANEL_H_STEP) };
        case "up":
          return { h: Math.max(PANEL_H_MIN, item.h - PANEL_H_STEP) };
      }
    }, panelKey);
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
    resetView,
    movePanel,
    resizePanel,
    onLayoutChange,
  };
}
