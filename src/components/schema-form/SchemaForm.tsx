/* eslint-disable @typescript-eslint/no-explicit-any */
import SchemaField from "@/components/schema-form/SchemaField";
import { SchemaFormProvider } from "@/components/schema-form/SchemaFormContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { FieldGroup } from "@/components/ui/field";
import type { InferredField } from "@/lib/inference";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

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
    <SchemaFormProvider onChange={onChange}>
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
                    status="inferred"
                  />
                ))}
              </FieldGroup>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </SchemaFormProvider>
  );
}
