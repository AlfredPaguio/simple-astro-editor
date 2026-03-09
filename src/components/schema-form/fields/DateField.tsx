/* eslint-disable @typescript-eslint/no-explicit-any */
import FieldLabelContent from "@/components/schema-form/FieldLabelContent";
import type { SchemaFieldProps } from "@/components/schema-form/SchemaField";
import { useSchemaForm } from "@/components/schema-form/SchemaFormContext";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Props {
  format: any;
}

function normalizeDate(value: any, format: string): string {
  if (!value) return "";
  // gray-matter parses bare YAML dates as JS Date instances
  if (value instanceof Date) {
    if (format === "date") {
      return value.toISOString().slice(0, 10); // "YYYY-MM-DD"
    }
    return value.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
  }
  return String(value);
}

export default function DateField({
  name,
  value,
  status = "known",
  schema,
  format,
}: SchemaFieldProps & Props) {
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
        type={format === "date" ? "date" : "datetime-local"}
        value={normalizeDate(value, format)}
        onChange={(e) => onChange(name, e.target.value)}
        className="h-8 text-sm w-full mt-1.5"
      />
    </Field>
  );
}
