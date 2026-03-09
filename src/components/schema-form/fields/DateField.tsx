/* eslint-disable @typescript-eslint/no-explicit-any */
import FieldLabelContent from "@/components/schema-form/FieldLabelContent";
import type { SchemaFieldProps } from "@/components/schema-form/SchemaField";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Props {
  format: any;
}

export default function DateField({
  name,
  value,
  onChange,
  status = "known",
  schema,
  format,
}: SchemaFieldProps & Props) {
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
        value={value || ""}
        onChange={(e) => onChange(name, e.target.value)}
        className="h-8 text-sm w-full"
      />
    </Field>
  );
}
