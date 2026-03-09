import FieldLabelContent from "@/components/schema-form/FieldLabelContent";
import type { SchemaFieldProps } from "@/components/schema-form/SchemaField";
import { useSchemaForm } from "@/components/schema-form/SchemaFormContext";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Plus, XIcon } from "lucide-react";

export default function ArrayPrimitiveField({
  name,
  value: arrayValue,
  schema,
  status = "known",
}: SchemaFieldProps) {
  const { onChange } = useSchemaForm();

  return (
    <Field
      className={cn(
        status === "inferred" && "bg-amber-50/30 dark:bg-amber-950/10",
      )}
    >
      <FieldLabel>
        <FieldLabelContent name={name} schema={schema} status={status} />
      </FieldLabel>
      <div className="space-y-1.5 mt-1.5">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {arrayValue.map((item: any, idx: number) => (
          <div key={idx} className="flex gap-1.5 items-center">
            <Input
              value={item}
              onChange={(e) => {
                const newArr = [...arrayValue];
                newArr[idx] = e.target.value;
                onChange(name, newArr);
              }}
              className="flex-1 h-8 text-sm"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
              onClick={() => {
                const newArr = arrayValue.filter(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (_: any, i: number) => i !== idx,
                );
                onChange(name, newArr);
              }}
            >
              <XIcon className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="w-full h-7 text-xs gap-1 border-dashed"
          onClick={() => onChange(name, [...arrayValue, ""])}
        >
          <Plus className="size-3" /> Add Item
        </Button>
      </div>
    </Field>
  );
}
