import FieldLabelContent from "@/components/schema-form/FieldLabelContent";
import type { SchemaFieldProps } from "@/components/schema-form/SchemaField";
import { useSchemaForm } from "@/components/schema-form/SchemaFormContext";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function NumberField({
  name,
  value,
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
      <FieldLabel htmlFor={`field-${name}`}>
        <FieldLabelContent name={name} schema={schema} status={status} />
      </FieldLabel>
      <Input
        id={`field-${name}`}
        type="number"
        value={value || ""}
        onChange={(e) => onChange(name, e.target.valueAsNumber)}
        className="h-8 text-sm"
      />
    </Field>
  );
}
