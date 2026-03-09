/* eslint-disable react-hooks/static-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { InferredField } from "@/lib/inference";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  BinaryIcon,
  CalendarDaysIcon,
  HashIcon,
  LinkIcon,
  ListIcon,
  MailIcon,
  Plus,
  ShapesIcon,
  TextIcon,
  Trash2,
  TypeIcon,
  X,
} from "lucide-react";

interface SchemaFormProps {
  properties: Record<string, any>;
  values: Record<string, any>;
  inferredFields: InferredField[];
  unknownFields: string[];
  onChange: (key: string, value: any) => void;
}

export function SchemaForm({
  properties,
  values,
  inferredFields,
  unknownFields,
  onChange,
}: SchemaFormProps) {
  const hasKnownFields = Object.keys(properties).length > 0;

  return (
    <div className="divide-y divide-border">
      {/* Known fields from Zod schema */}
      {hasKnownFields && (
        <FieldGroup className="px-3 py-3 gap-3">
          {Object.entries(properties).map(([key, schema]: [string, any]) => (
            <SchemaField
              key={key}
              name={key}
              schema={schema}
              value={values[key]}
              onChange={onChange}
              status={unknownFields.includes(key) ? "unknown" : "known"}
            />
          ))}
        </FieldGroup>
      )}

      {/* Inferred fields section */}
      {inferredFields.length > 0 && (
        <Alert
          className={cn(
            "rounded-lg border overflow-hidden px-0 py-0",
            hasKnownFields && "mt-4",
          )}
        >
          <AlertTitle className="text-yellow-800 dark:text-yellow-200 flex items-center gap-2 px-3 py-2.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            Inferred Fields - Found in frontmatter but not defined in
            content.config.ts
            <Badge
              variant="outline"
              className="ml-auto text-[10px] h-4 px-1.5 border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400 font-normal"
            >
              {inferredFields.length} not in schema
            </Badge>
          </AlertTitle>
          <AlertDescription className="divide-y divide-border text-yellow-700 dark:text-yellow-300">
            <FieldGroup className="px-3 py-3 gap-3">
              {inferredFields.map((field) => (
                <SchemaField
                  key={field.key}
                  name={field.key}
                  schema={field.inferredSchema}
                  value={field.value}
                  onChange={onChange}
                  status="inferred"
                />
              ))}
            </FieldGroup>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

interface SchemaFieldProps {
  name: string;
  schema: any;
  value: any;
  onChange: (key: string, value: any) => void;
  status?: "known" | "inferred" | "unknown";
}

function FieldTypeIcon({ schema }: { schema: any }) {
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

  const labelContent = (
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

  // Boolean Switch
  if (type === "boolean") {
    return (
      <Field
        orientation="horizontal"
        className={cn(
          status === "inferred" &&
            "bg-amber-50/30 dark:bg-amber-950/10 -mx-3 px-3 py-1 rounded-none",
        )}
      >
        <Switch
          id={`field-${name}`}
          checked={value || false}
          onCheckedChange={(v) => onChange(name, v)}
          className="ml-4 shrink-0"
        />
        <FieldContent>
          <FieldLabel htmlFor={`field-${name}`}>{labelContent}</FieldLabel>
        </FieldContent>
      </Field>
    );
  }

  // Nested Object
  if (type === "object" && schema.properties) {
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

  // Array
  if (type === "array") {
    const arrayValue = Array.isArray(value) ? value : [];
    const isObjectArray =
      schema.items?.type === "object" && schema.items?.properties;

    // a. Array of Objects
    if (isObjectArray) {
      const itemProperties = schema.items.properties;
      return (
        <FieldSet
          className={cn(
            "gap-0 rounded-md border overflow-hidden",
            status === "inferred" &&
              "border-amber-200 dark:border-amber-800/50",
          )}
        >
          <div
            className={cn(
              "flex items-center justify-between px-3 py-2 border-b bg-muted/30",
              status === "inferred" &&
                "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50",
            )}
          >
            <FieldLegend
              variant="label"
              className="text-xs font-semibold flex items-center gap-1.5 m-0"
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
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-xs px-2 gap-1"
              onClick={() => onChange(name, [...arrayValue, {}])}
            >
              <Plus className="size-3" />
              Add
            </Button>
          </div>

          <div className="divide-y divide-border bg-muted/10">
            {arrayValue.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">
                No items yet.
              </p>
            )}

            {arrayValue.map((item: any, idx: number) => (
              <div key={idx}>
                <div className="flex items-center justify-between px-3 py-1.5 bg-muted/20 border-b">
                  <span className="text-[10px] font-mono text-muted-foreground">
                    Item {idx + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() =>
                      onChange(
                        name,
                        arrayValue.filter((_: any, i: number) => i !== idx),
                      )
                    }
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                <FieldGroup className="px-3 py-3 gap-3">
                  {Object.entries(itemProperties).map(
                    ([propKey, propSchema]: [string, any]) => (
                      <SchemaField
                        key={propKey}
                        name={propKey}
                        schema={propSchema}
                        value={(item || {})[propKey]}
                        onChange={(k, v) => {
                          const newArr = [...arrayValue];
                          newArr[idx] = { ...(newArr[idx] || {}), [k]: v };
                          onChange(name, newArr);
                        }}
                        status="known"
                      />
                    ),
                  )}
                </FieldGroup>
              </div>
            ))}
          </div>
        </FieldSet>
      );
    }

    // b. Simple Array (Strings/Numbers)
    return (
      <Field
        className={cn(
          status === "inferred" && "bg-amber-50/30 dark:bg-amber-950/10",
        )}
      >
        <FieldLabel>{labelContent}</FieldLabel>
        <div className="space-y-1.5 mt-1.5">
          {arrayValue.map((item: any, idx: number) => (
            <div key={idx} className="flex gap-1.5 items-center">
              <Input
                value={item}
                onChange={(e) => {
                  const newArr = [...arrayValue];
                  newArr[idx] = e.target.value;
                  onChange(name, newArr);
                }}
                className="flex-1 h-8 text-sm"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                onClick={() => {
                  const newArr = arrayValue.filter(
                    (_: any, i: number) => i !== idx,
                  );
                  onChange(name, newArr);
                }}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="w-full h-7 text-xs gap-1 border-dashed"
            onClick={() => onChange(name, [...arrayValue, ""])}
          >
            <Plus className="size-3" /> Add Item
          </Button>
        </div>
      </Field>
    );
  }

  // Enum Selection
  if (enumOptions) {
    return (
      <Field
        className={cn(
          status === "inferred" && "bg-amber-50/30 dark:bg-amber-950/10",
        )}
      >
        <FieldLabel htmlFor={`field-${name}`}>{labelContent}</FieldLabel>
        <Select value={value || ""} onValueChange={(v) => onChange(name, v)}>
          <SelectTrigger id={`field-${name}`} className="h-8 text-sm">
            <SelectValue placeholder="Select an option..." />
          </SelectTrigger>
          <SelectContent>
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

  // Number Input
  if (type === "number") {
    return (
      <Field
        className={cn(
          status === "inferred" && "bg-amber-50/30 dark:bg-amber-950/10",
        )}
      >
        <FieldLabel htmlFor={`field-${name}`}>{labelContent}</FieldLabel>
        <Input
          id={`field-${name}`}
          type="number"
          value={value || ""}
          onChange={(e) => onChange(name, e.target.valueAsNumber)}
          className="h-8 text-sm"
        />
      </Field>
    );
  }

  // Date / DateTime
  if (format === "date" || format === "date-time") {
    return (
      <Field
        className={cn(
          status === "inferred" && "bg-amber-50/30 dark:bg-amber-950/10",
        )}
      >
        <FieldLabel htmlFor={`field-${name}`}>{labelContent}</FieldLabel>
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

  // Default: String Input
  return (
    <Field
      className={cn(
        status === "inferred" && "bg-amber-50/30 dark:bg-amber-950/10",
      )}
    >
      <FieldLabel htmlFor={`field-${name}`}>{labelContent}</FieldLabel>
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
