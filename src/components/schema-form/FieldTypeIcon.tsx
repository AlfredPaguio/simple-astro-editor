import {
  BinaryIcon,
  CalendarDaysIcon,
  HashIcon,
  LinkIcon,
  ListIcon,
  MailIcon,
  ShapesIcon,
  TextIcon,
  TypeIcon,
} from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function FieldTypeIcon({ schema }: { schema: any }) {
  const type = schema?.type || "string";
  const format = schema?.format;
  const cls = "h-3 w-3 shrink-0 text-muted-foreground/50";

  if (schema?.enum) return <ListIcon className={cls} />;
  if (type === "boolean") return <BinaryIcon className={cls} />;
  if (type === "number") return <HashIcon className={cls} />;
  if (type === "array" || type === "object")
    return <ShapesIcon className={cls} />;
  if (format === "date" || format === "date-time")
    return <CalendarDaysIcon className={cls} />;
  if (format === "email") return <MailIcon className={cls} />;
  if (format === "uri") return <LinkIcon className={cls} />;
  if (type === "string") return <TypeIcon className={cls} />;
  return <TextIcon className={cls} />;
}
