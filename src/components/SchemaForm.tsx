/* eslint-disable react-hooks/static-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AlertTriangle, Plus, X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InferredField } from "@/lib/inference";

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
  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Known fields from Zod schema */}
        {Object.entries(properties).map(([key, schema]: [string, any]) => (
          <FormField
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
          <Alert className="mt-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800 dark:text-yellow-200">
              Inferred Fields
            </AlertTitle>
            <AlertDescription className="text-yellow-700 dark:text-yellow-300 mb-4">
              Found in frontmatter but not defined in content.config.ts
              <div className="space-y-4 pt-4">
                {inferredFields.map((field) => (
                  <FormField
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
    </TooltipProvider>
  );
}

interface FormFieldProps {
  name: string;
  schema: any;
  value: any;
  onChange: (key: string, value: any) => void;
  status?: "known" | "inferred" | "unknown";
}

function FormField({
  name,
  schema,
  value,
  onChange,
  status = "known",
}: FormFieldProps) {
  const type = schema.type || "string";
  const format = schema.format;
  const enumOptions = schema.enum;

  // Helper to generate Status Badge
  const StatusBadge = () => {
    if (status === "known") return null;
    return (
      <Badge
        variant={status === "inferred" ? "outline" : "secondary"}
        className={cn(
          "ml-2 font-normal",
          status === "inferred" &&
            "border-yellow-400 text-yellow-700 bg-yellow-50",
        )}
      >
        {status === "inferred" ? "Inferred" : "Optional"}
      </Badge>
    );
  };

  // Helper for Input wrapper styles based on status
  const inputWrapperClass = cn(
    "space-y-2",
    status === "inferred" &&
      "rounded-md p-2 -m-2 border border-dashed border-yellow-300 bg-yellow-50/50",
  );

  // 1. Enum Selection
  if (enumOptions) {
    return (
      <div className={inputWrapperClass}>
        <div className="flex items-center">
          <Label className="text-sm font-medium">{name}</Label>
          <StatusBadge />
        </div>
        <Select value={value || ""} onValueChange={(v) => onChange(name, v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select an option..." />
          </SelectTrigger>
          <SelectContent>
            {enumOptions.map((opt: any) => (
              <SelectItem key={opt} value={opt}>
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
        className={cn(
          inputWrapperClass,
          "flex items-center justify-between rounded-md border p-3 shadow-sm",
        )}
      >
        <div className="flex items-center">
          <Label className="text-sm font-medium">{name}</Label>
          <StatusBadge />
        </div>
        <Switch
          checked={value || false}
          onCheckedChange={(v) => onChange(name, v)}
        />
      </div>
    );
  }

  // 3. Number Input
  if (type === "number") {
    return (
      <div className={inputWrapperClass}>
        <div className="flex items-center">
          <Label className="text-sm font-medium">{name}</Label>
          <StatusBadge />
        </div>
        <Input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(name, e.target.valueAsNumber)}
        />
      </div>
    );
  }

  // 4. Date / DateTime
  if (type === "string" && (format === "date" || format === "date-time")) {
    return (
      <div className={inputWrapperClass}>
        <div className="flex items-center">
          <Label className="text-sm font-medium">{name}</Label>
          <StatusBadge />
        </div>
        <Input
          type={format === "date" ? "date" : "datetime-local"}
          value={value || ""}
          onChange={(e) => onChange(name, e.target.value)}
          className="w-full md:w-auto"
        />
      </div>
    );
  }

  // 5. Nested Object
  if (type === "object" && schema.properties) {
    const objectValue = value || {};
    return (
      <div className="space-y-3 rounded-md border p-4 bg-muted/30">
        <div className="flex items-center">
          <Label className="text-sm font-semibold text-primary">{name}</Label>
          <StatusBadge />
        </div>
        <div className="space-y-4 pl-4 border-l-2 border-border">
          {Object.entries(schema.properties).map(
            ([propKey, propSchema]: [string, any]) => (
              <FormField
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
        <div className="space-y-3 rounded-md border p-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Label className="text-sm font-semibold text-primary">
                {name}
              </Label>
              <StatusBadge />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChange(name, [...arrayValue, {}])}
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {arrayValue.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">
                No items added.
              </p>
            )}
            {arrayValue.map((item: any, idx: number) => (
              <div
                key={idx}
                className="relative space-y-3 border rounded-md p-4 pt-8 bg-background"
              >
                <div className="absolute top-2 right-2 flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    #{idx + 1}
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

                <div className="space-y-4 pl-4 border-l-2 border-border">
                  {Object.entries(itemProperties).map(
                    ([propKey, propSchema]: [string, any]) => (
                      <FormField
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
        <div className="flex items-center">
          <Label className="text-sm font-medium">{name}</Label>
          <StatusBadge />
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
                className="flex-1"
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
            className="w-full"
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
      <div className="flex items-center">
        <Label className="text-sm font-medium">{name}</Label>
        <StatusBadge />
      </div>
      <Input
        type={format === "email" ? "email" : format === "uri" ? "url" : "text"}
        value={value || ""}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={format === "email" ? "email@example.com" : undefined}
      />
    </div>
  );
}
