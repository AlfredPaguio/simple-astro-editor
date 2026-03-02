/* eslint-disable @typescript-eslint/no-explicit-any */
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Info, AlertTriangle } from "lucide-react";
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

      {/* Inferred fields */}
      {inferredFields.length > 0 && (
        <div className="p-4 border border-yellow-300 rounded-lg bg-yellow-50/50">
          <h4 className="font-medium text-yellow-800 flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4" />
            Inferred Fields
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 opacity-70" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Found in frontmatter but not in content.config.ts</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h4>
          <div className="space-y-4">
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
        </div>
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

  const label = (
    <div className="flex items-center gap-2">
      <span>{name}</span>
      {status === "inferred" && <Badge variant="inferred">Inferred</Badge>}
      {status === "unknown" && <Badge variant="unknown">Optional</Badge>}
    </div>
  );

  if (enumOptions) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Select value={value || ""} onValueChange={(v) => onChange(name, v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select..." />
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

  if (type === "boolean") {
    return (
      <div className="flex items-center justify-between space-x-2">
        <Label>{label}</Label>
        <Switch
          checked={value || false}
          onCheckedChange={(v) => onChange(name, v)}
        />
      </div>
    );
  }

  if (type === "number") {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(name, e.target.valueAsNumber)}
          className={cn(
            status === "inferred" && "border-yellow-300 bg-yellow-50",
            status === "unknown" && "border-gray-300 bg-gray-50",
          )}
        />
      </div>
    );
  }

  if (type === "string" && format === "date") {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Input
          type="date"
          value={value || ""}
          onChange={(e) => onChange(name, e.target.value)}
          className={cn(
            status === "inferred" && "border-yellow-300 bg-yellow-50",
            status === "unknown" && "border-gray-300 bg-gray-50",
          )}
        />
      </div>
    );
  }

  if (type === "string" && format === "date-time") {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <Input
          type="datetime-local"
          value={value || ""}
          onChange={(e) => onChange(name, e.target.value)}
          className={cn(
            status === "inferred" && "border-yellow-300 bg-yellow-50",
            status === "unknown" && "border-gray-300 bg-gray-50",
          )}
        />
      </div>
    );
  }

  if (type === "object" && schema.properties) {
    const objectValue = value || {};
    return (
      <div className="space-y-4 border p-4 rounded-md">
        <Label>{label}</Label>
        <div className="pl-4 border-l-2 space-y-4">
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

  if (type === "array") {
    const arrayValue = Array.isArray(value) ? value : [];
    
    // Array of objects
    if (schema.items?.type === "object" && schema.items.properties) {
      const ObjectProperties = schema.items.properties;
      return (
        <div className="space-y-4 border p-4 rounded-md bg-zinc-50/50">
          <Label>{label}</Label>
          {arrayValue.map((item: any, idx: number) => (
            <div key={idx} className="space-y-4 pb-4 border-b border-zinc-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm text-zinc-600">Item {idx + 1}</span>
                <button
                  onClick={() => {
                    const newArr = arrayValue.filter((_, i) => i !== idx);
                    onChange(name, newArr);
                  }}
                  className="px-2 py-1 text-xs text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded"
                >
                  Remove item
                </button>
              </div>
              <div className="pl-4 border-l-2 border-zinc-300 space-y-4">
                {Object.entries(ObjectProperties).map(
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
          <button
            onClick={() => onChange(name, [...arrayValue, {}])}
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            + Add object
          </button>
        </div>
      );
    }

    // Simple array of strings/numbers
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="space-y-2">
          {arrayValue.map((item: any, idx: number) => (
            <div key={idx} className="flex gap-2">
              <Input
                value={item}
                onChange={(e) => {
                  const newArr = [...arrayValue];
                  newArr[idx] = e.target.value;
                  onChange(name, newArr);
                }}
              />
              <button
                onClick={() => {
                  const newArr = arrayValue.filter(
                    (_: any, i: number) => i !== idx,
                  );
                  onChange(name, newArr);
                }}
                className="px-2 text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={() => onChange(name, [...arrayValue, ""])}
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            + Add item
          </button>
        </div>
      </div>
    );
  }

  // Default: string input
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type={format === "email" ? "email" : format === "uri" ? "url" : "text"}
        value={value || ""}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={format === "email" ? "email@example.com" : undefined}
        className={cn(
          status === "inferred" && "border-yellow-300 bg-yellow-50",
          status === "unknown" && "border-gray-300 bg-gray-50",
        )}
      />
    </div>
  );
}
