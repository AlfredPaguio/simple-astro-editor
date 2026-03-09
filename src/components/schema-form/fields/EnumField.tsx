import FieldLabelContent from "@/components/schema-form/FieldLabelContent";
import type { SchemaFieldProps } from "@/components/schema-form/SchemaField";
import { useSchemaForm } from "@/components/schema-form/SchemaFormContext";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  enumOptions: any;
}

export default function EnumField({
  name,
  value,
  status = "known",
  schema,
  enumOptions,
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
      <Select value={value || ""} onValueChange={(v) => onChange(name, v)}>
        <SelectTrigger id={`field-${name}`} className="h-8 text-sm">
          <SelectValue placeholder="Select an option..." />
        </SelectTrigger>
        <SelectContent>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {enumOptions.map((opt: any) => (
            <SelectItem key={opt} value={opt} className="text-sm">
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}
