import FieldLabelContent from "@/components/schema-form/FieldLabelContent";
import type { SchemaFieldProps } from "@/components/schema-form/SchemaField";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  format: any;
}

export default function StringField({
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
        type={format === "email" ? "email" : format === "uri" ? "url" : "text"}
        value={value || ""}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={
          format === "email"
            ? "email@example.com"
            : format === "uri"
              ? "https://"
              : undefined
        }
        className="h-8 text-sm mt-1.5"
      />
    </Field>
  );
}
