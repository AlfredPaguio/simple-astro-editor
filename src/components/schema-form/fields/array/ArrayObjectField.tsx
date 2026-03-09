import { FieldTypeIcon } from "@/components/schema-form/FieldTypeIcon";
import type { SchemaFieldProps } from "@/components/schema-form/SchemaField";
import SchemaField from "@/components/schema-form/SchemaField";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";

export default function ArrayObjectField({
  name,
  schema,
  value: arrayValue,
  onChange,
  status = "known",
}: SchemaFieldProps) {
  const itemProperties = schema.items.properties;

  return (
    <FieldSet
      className={cn(
        "gap-0 rounded-md border overflow-hidden",
        status === "inferred" && "border-amber-200 dark:border-amber-800/50",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between px-3 py-2 border-b bg-muted/30",
          status === "inferred" &&
            "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50",
        )}
      >
        <FieldLegend
          variant="label"
          className="text-xs font-semibold flex items-center gap-1.5 m-0"
        >
          <FieldTypeIcon schema={schema} />
          {name}
          {status === "inferred" && (
            <Badge
              variant="outline"
              className="text-[10px] h-4 px-1.5 ml-1 border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400 font-normal"
            >
              inferred
            </Badge>
          )}
        </FieldLegend>
        <Button
          variant="outline"
          size="sm"
          className="h-6 text-xs px-2 gap-1"
          onClick={() => onChange(name, [...arrayValue, {}])}
        >
          <Plus className="size-3" />
          Add
        </Button>
      </div>

      <div className="divide-y divide-border bg-muted/10">
        {arrayValue.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">
            No items yet.
          </p>
        )}

        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {arrayValue.map((item: any, idx: number) => (
          <div key={idx}>
            <div className="flex items-center justify-between px-3 py-1.5 bg-muted/20 border-b">
              <span className="text-[10px] font-mono text-muted-foreground">
                Item {idx + 1}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() =>
                  onChange(
                    name,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    arrayValue.filter((_: any, i: number) => i !== idx),
                  )
                }
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>

            <FieldGroup className="px-3 py-3 gap-3">
              {Object.entries(itemProperties).map(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ([propKey, propSchema]: [string, any]) => (
                  <SchemaField
                    key={propKey}
                    name={propKey}
                    schema={propSchema}
                    value={(item || {})[propKey]}
                    onChange={(k, v) => {
                      const newArr = [...arrayValue];
                      newArr[idx] = { ...(newArr[idx] || {}), [k]: v };
                      onChange(name, newArr);
                    }}
                    status="known"
                  />
                ),
              )}
            </FieldGroup>
          </div>
        ))}
      </div>
    </FieldSet>
  );
}
