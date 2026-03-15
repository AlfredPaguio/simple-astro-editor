import { FileCode2 } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { type ComponentProps } from "react";
import type { CollectionSchema } from "@/lib/schema-evaluator";
import { SchemaForm } from "@/components/schema-form/SchemaForm";
import type { InferredField } from "@/lib/inference";

interface FrontmatterSidebarProps extends ComponentProps<typeof Sidebar> {
  currentSchema: CollectionSchema | undefined;
  frontmatter: Record<string, unknown>;
  inferredFields: InferredField[];
  unknownFields: string[];
  schemaFormKey: string;
  onFieldChange: (key: string, value: unknown) => void;
}

export function FrontmatterSidebar({
  currentSchema,
  frontmatter,
  inferredFields,
  unknownFields,
  schemaFormKey,
  onFieldChange,
  ...props
}: FrontmatterSidebarProps) {
  const hasContent =
    Object.keys(frontmatter).length > 0 || currentSchema !== undefined;

  return (
    <Sidebar
      side="right"
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      variant="floating"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex w-full items-center gap-2 p-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <FileCode2 className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Frontmatter</span>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        {hasContent ? (
          <SchemaForm
            key={schemaFormKey}
            properties={currentSchema?.jsonSchema.properties || {}}
            values={frontmatter}
            inferredFields={inferredFields}
            unknownFields={unknownFields}
            onChange={onFieldChange}
          />
        ) : (
          <p className="text-xs text-muted-foreground px-2">
            Open a file to edit its frontmatter.
          </p>
        )}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
