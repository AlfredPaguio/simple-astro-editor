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
  onChange: (key: string, value: any) => void;
  status?: "known" | "inferred" | "unknown";
}

function SchemaField({
  name,
  schema,
  value,
  onChange,
  status = "known",
}: SchemaFieldProps) {
  const type = schema?.type || "string";
  const format = schema?.format;
  const enumOptions = schema?.enum;

  // Boolean Switch
  if (type === "boolean") {
    <BooleanField
      name={name}
      onChange={onChange}
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
        onChange={onChange}
        schema={schema}
        value={value}
        status={status}
      />
    );
  }

  // Array
  if (type === "array") {
    <ArrayField
      name={name}
      onChange={onChange}
      schema={schema}
      value={value}
      status={status}
    />;
  }

  // Enum Selection
  if (enumOptions) {
    <EnumField
      enumOptions={enumOptions}
      name={name}
      onChange={onChange}
      schema={schema}
      value={value}
      status={status}
    />;
  }

  // Number Input
  if (type === "number") {
    <NumberField
      name={name}
      onChange={onChange}
      schema={schema}
      value={value}
      status={status}
    />;
  }

  // Date / DateTime
  if (format === "date" || format === "date-time") {
    <DateField
      format={format}
      name={name}
      onChange={onChange}
      schema={schema}
      value={value}
      status={status}
    />;
  }

  // Default: String Input
  <StringField
    format={format}
    name={name}
    onChange={onChange}
    schema={schema}
    value={value}
    status={status}
  />;
}

export default SchemaField;
