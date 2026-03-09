/* eslint-disable react-hooks/static-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="space-y-6">
      {/* Known fields from Zod schema */}
      {hasKnownFields &&
        Object.entries(properties).map(([key, schema]: [string, any]) => (
          <CustomFormField
            key={key}
            name={key}
            schema={schema}
            value={values[key]}
            onChange={onChange}
            status={unknownFields.includes(key) ? "unknown" : "known"}
          />
        ))}

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
            Inferred Fields
            <Badge
              variant="outline"
              className="ml-auto text-[10px] h-4 px-1.5 border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400 font-normal"
            >
              {inferredFields.length} not in schema
            </Badge>
          </AlertTitle>
          <AlertDescription className="divide-y divide-border text-yellow-700 dark:text-yellow-300">
            Found in frontmatter but not defined in content.config.ts
            <div className="space-y-4 pt-4">
              {inferredFields.map((field) => (
                <CustomFormField
                  key={field.key}
                  name={field.key}
                  schema={field.inferredSchema}
                  value={field.value}
                  onChange={onChange}
                  status="inferred"
                />
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

interface FormFieldProps {
  name: string;
  schema: any;
  value: any;
  onChange: (key: string, value: any) => void;
  status?: "known" | "inferred" | "unknown";
}

function FieldTypeIcon({ schema }: { schema: any }) {
  const type = schema?.type || "string";
  const format = schema?.format;
  const iconClass = "h-3 w-3 shrink-0";

  if (schema?.enum) return <ListIcon className={iconClass} />;
  if (type === "boolean") return <BinaryIcon className={iconClass} />;
  if (type === "number") return <HashIcon className={iconClass} />;
  if (type === "array") return <ShapesIcon className={iconClass} />;
  if (type === "object") return <ShapesIcon className={iconClass} />;
  if (format === "date" || format === "date-time")
    return <CalendarDaysIcon className={iconClass} />;
  if (format === "email") return <MailIcon className={iconClass} />;
  if (format === "uri") return <LinkIcon className={iconClass} />;
  if (type === "string") return <TypeIcon className={iconClass} />;
  return <TextIcon className={iconClass} />;
}

function CustomFieldLabel({
  name,
  schema,
  status,
}: {
  name: string;
  schema: any;
  status: "known" | "inferred" | "unknown";
}) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <span className="text-muted-foreground/60">
        <FieldTypeIcon schema={schema} />
      </span>
      <Label className="text-sm font-medium leading-none">{name}</Label>
      {status === "inferred" && (
        <Badge
          variant="outline"
          className="text-[10px] h-4 px-1.5 ml-auto border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400 font-normal"
        >
          inferred
        </Badge>
      )}
    </div>
  );
}

function CustomFormField({
  name,
  schema,
  value,
  onChange,
  status = "known",
}: FormFieldProps) {
  const type = schema.type || "string";
  const format = schema.format;
  const enumOptions = schema.enum;

  // Helper for Input wrapper styles based on status
  const inputWrapperClass = cn(
    "px-3 py-2.5",
    status === "inferred" && "bg-amber-50/40 dark:bg-amber-950/20",
  );

  // 1. Enum Selection
  if (enumOptions) {
    return (
      <div className={inputWrapperClass}>
        <CustomFieldLabel name={name} schema={schema} status={status} />
        <Select value={value || ""} onValueChange={(v) => onChange(name, v)}>
          <SelectTrigger className="h-8 text-sm">
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
      </div>
    );
  }

  // 2. Boolean Switch
  if (type === "boolean") {
    return (
      <div
        className={cn(inputWrapperClass, "flex items-center justify-between")}
      >
        <CustomFieldLabel name={name} schema={schema} status={status} />
        <Switch
          checked={value || false}
          onCheckedChange={(v) => onChange(name, v)}
          className="ml-4 shrink-0"
        />
      </div>
    );
  }

  // 3. Number Input
  if (type === "number") {
    return (
      <div className={inputWrapperClass}>
        <CustomFieldLabel name={name} schema={schema} status={status} />
        <Input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(name, e.target.valueAsNumber)}
          className="h-8 text-sm"
        />
      </div>
    );
  }

  // 4. Date / DateTime
  if (type === "string" && (format === "date" || format === "date-time")) {
    return (
      <div className={inputWrapperClass}>
        <CustomFieldLabel name={name} schema={schema} status={status} />
        <Input
          type={format === "date" ? "date" : "datetime-local"}
          value={value || ""}
          onChange={(e) => onChange(name, e.target.value)}
          className="h-8 text-sm w-full"
        />
      </div>
    );
  }

  // 5. Nested Object
  if (type === "object" && schema.properties) {
    const objectValue = value || {};
    return (
      <div className={inputWrapperClass}>
        <CustomFieldLabel name={name} schema={schema} status={status} />
        <div className="rounded-md border bg-muted/20 overflow-hidden divide-y divide-border">
          {Object.entries(schema.properties).map(
            ([propKey, propSchema]: [string, any]) => (
              <CustomFormField
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
        </div>
      </div>
    );
  }

  // 6. Array
  if (type === "array") {
    const arrayValue = Array.isArray(value) ? value : [];

    // 6a. Array of Objects
    if (schema.items?.type === "object" && schema.items.properties) {
      const itemProperties = schema.items.properties;
      return (
        <div className={inputWrapperClass}>
          <div className="flex items-center justify-between mb-2">
            <CustomFieldLabel name={name} schema={schema} status={status} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChange(name, [...arrayValue, {}])}
            >
              <Plus className="size-4 mr-1" /> Add Item
            </Button>
          </div>

          <div className="space-y-2">
            {arrayValue.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">
                No items yet.
              </p>
            )}
            {arrayValue.map((item: any, idx: number) => (
              <div
                key={idx}
                className="rounded-md border bg-muted/20 overflow-hidden"
              >
                <div className="flex items-center justify-between px-3 py-1.5 border-b bg-muted/30">
                  <span className="text-xs font-mono text-muted-foreground">
                    Item #{idx + 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      const newArr = arrayValue.filter((_, i) => i !== idx);
                      onChange(name, newArr);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="divide-y divide-border space-y-2">
                  {Object.entries(itemProperties).map(
                    ([propKey, propSchema]: [string, any]) => (
                      <CustomFormField
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
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 6b. Simple Array (Strings/Numbers)
    return (
      <div className={inputWrapperClass}>
        <div className="flex items-center justify-between mb-2">
          <CustomFieldLabel name={name} schema={schema} status={status} />
        </div>
        <div className="space-y-2">
          {arrayValue.map((item: any, idx: number) => (
            <div key={idx} className="flex gap-2 items-center">
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
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                onClick={() => {
                  const newArr = arrayValue.filter(
                    (_: any, i: number) => i !== idx,
                  );
                  onChange(name, newArr);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="w-full h-7 text-xs gap-1 border-dashed"
            onClick={() => onChange(name, [...arrayValue, ""])}
          >
            <Plus className="h-3.5 w-3.5 mr-2" /> Add Item
          </Button>
        </div>
      </div>
    );
  }

  // 7. Default: String Input
  return (
    <div className={inputWrapperClass}>
      <CustomFieldLabel name={name} schema={schema} status={status} />
      <Input
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
        className="h-8 text-sm"
      />
    </div>
  );
}
