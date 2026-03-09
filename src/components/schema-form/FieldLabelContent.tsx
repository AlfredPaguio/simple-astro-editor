import { FieldTypeIcon } from "@/components/schema-form/FieldTypeIcon";
import type { SchemaFieldProps } from "@/components/schema-form/SchemaField";
import { Badge } from "@/components/ui/badge";

type Props = Omit<SchemaFieldProps, "value" | "onChange">;

export default function FieldLabelContent({
  name,
  schema,
  status = "known",
}: Props) {
  return (
    <div className="flex items-center gap-1.5">
      <FieldTypeIcon schema={schema} />
      <span>{name}</span>
      {status === "inferred" && (
        <Badge
          variant="outline"
          className="text-[10px] h-4 px-1.5 ml-1 border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400 font-normal"
        >
          inferred
        </Badge>
      )}
    </div>
  );
}
