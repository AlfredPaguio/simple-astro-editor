import FieldLabelContent from "@/components/schema-form/FieldLabelContent";
import type { SchemaFieldProps } from "@/components/schema-form/SchemaField";
import { useSchemaForm } from "@/components/schema-form/SchemaFormContext";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export default function BooleanField({
  name,
  schema,
  value,
  status = "known",
}: SchemaFieldProps) {
  const { onChange } = useSchemaForm();

  return (
    <Field
      orientation="horizontal"
      className={cn(
        status === "inferred" &&
          "bg-amber-50/30 dark:bg-amber-950/10 -mx-3 px-3 py-1 rounded-none",
      )}
    >
      <Switch
        id={`field-${name}`}
        checked={value || false}
        onCheckedChange={(v) => onChange(name, v)}
        className="ml-4 shrink-0"
      />
      <FieldContent>
        <FieldLabel htmlFor={`field-${name}`}>
          <FieldLabelContent name={name} schema={schema} status={status} />
        </FieldLabel>
      </FieldContent>
    </Field>
  );
}
