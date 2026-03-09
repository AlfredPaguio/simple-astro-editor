import ArrayObjectField from "@/components/schema-form/fields/array/ArrayObjectField";
import ArrayPrimitiveField from "@/components/schema-form/fields/array/ArrayPrimitiveField";
import type { SchemaFieldProps } from "@/components/schema-form/SchemaField";

export default function ArrayField({
  name,
  schema,
  value,
  onChange,
  status = "known",
}: SchemaFieldProps) {
  const arrayValue = Array.isArray(value) ? value : [];
  const isObjectArray =
    schema.items?.type === "object" && schema.items?.properties;

  // a. Array of Objects
  if (isObjectArray) {
    return (
      <ArrayObjectField
        name={name}
        onChange={onChange}
        schema={schema}
        value={arrayValue}
        status={status}
      />
    );
  }

  // b. Simple Array (Strings/Numbers)
  return (
    <ArrayPrimitiveField
      name={name}
      onChange={onChange}
      schema={schema}
      value={arrayValue}
      status={status}
    />
  );
}
