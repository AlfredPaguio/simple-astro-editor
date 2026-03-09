import { FieldTypeIcon } from "@/components/schema-form/FieldTypeIcon";
import SchemaField, {
  type SchemaFieldProps,
} from "@/components/schema-form/SchemaField";
import { Badge } from "@/components/ui/badge";
import { FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { cn } from "@/lib/utils";

function NestedObjectField({
  name,
  schema,
  value,
  onChange,
  status = "known",
}: SchemaFieldProps) {
  const objectValue = value || {};

  return (
    <FieldSet
      className={cn(
        "gap-0 rounded-md border overflow-hidden",
        status === "inferred" && "border-amber-200 dark:border-amber-800/50",
      )}
    >
      <FieldLegend
        variant="label"
        className={cn(
          "px-3 py-2 border-b bg-muted/30 text-xs font-semibold flex items-center gap-1.5",
          status === "inferred" &&
            "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50",
        )}
      >
        <FieldTypeIcon schema={schema} />
        {name}
        {status === "inferred" && (
          <Badge
            variant="outline"
            className="text-[10px] h-4 px-1.5 ml-1 border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400 font-normal"
          >
            inferred
          </Badge>
        )}
      </FieldLegend>
      <FieldGroup className="px-3 py-3 gap-3 bg-muted/10">
        {Object.entries(schema.properties).map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ([propKey, propSchema]: [string, any]) => (
            <SchemaField
              key={propKey}
              name={propKey}
              schema={propSchema}
              value={objectValue[propKey]}
              onChange={(k, v) => {
                onChange(name, { ...objectValue, [k]: v });
              }}
              status="known"
            />
          ),
        )}
      </FieldGroup>
    </FieldSet>
  );
}

export default NestedObjectField;
