/* eslint-disable @typescript-eslint/no-explicit-any */
import ArrayField from "@/components/schema-form/fields/array/ArrayField";
import BooleanField from "@/components/schema-form/fields/BooleanField";
import DateField from "@/components/schema-form/fields/DateField";
import EnumField from "@/components/schema-form/fields/EnumField";
import NestedObjectField from "@/components/schema-form/fields/NestedObjectField";
import NumberField from "@/components/schema-form/fields/NumberField";
import StringField from "@/components/schema-form/fields/StringField";

export interface SchemaFieldProps {
  name: string;
  schema: any;
  value: any;
  status?: "known" | "inferred" | "unknown";
}

function SchemaField({
  name,
  schema,
  value,
  status = "known",
}: SchemaFieldProps) {
  const type = schema?.type || "string";
  const format = schema?.format;
  const enumOptions = schema?.enum;

  // Boolean Switch
  if (type === "boolean") {
    return <BooleanField
      name={name}
      schema={schema}
      value={value}
      status={status}
    />;
  }

  // Nested Object
  if (type === "object" && schema.properties) {
    return (
      <NestedObjectField
        name={name}
        schema={schema}
        value={value}
        status={status}
      />
    );
  }

  // Array
  if (type === "array") {
    return <ArrayField
      name={name}
      schema={schema}
      value={value}
      status={status}
    />;
  }

  // Enum Selection
  if (enumOptions) {
    return <EnumField
      enumOptions={enumOptions}
      name={name}
      schema={schema}
      value={value}
      status={status}
    />;
  }

  // Number Input
  if (type === "number") {
    return <NumberField
      name={name}
      schema={schema}
      value={value}
      status={status}
    />;
  }

  // Date / DateTime
  if (format === "date" || format === "date-time") {
    return <DateField
      format={format}
      name={name}
      schema={schema}
      value={value}
      status={status}
    />;
  }

  // Default: String Input
  return <StringField
    format={format}
    name={name}
    schema={schema}
    value={value}
    status={status}
  />;
}

export default SchemaField;
