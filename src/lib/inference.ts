/* eslint-disable @typescript-eslint/no-explicit-any */
export interface FieldAnalysis {
  known: string[]; // In schema + in frontmatter
  inferred: InferredField[]; // In frontmatter, NOT in schema
  unknown: string[]; // In schema, NOT in frontmatter (optional)
}

export interface InferredField {
  key: string;
  value: any;
  inferredType: string;
  inferredSchema: any;
}

export function analyzeFields(
  frontmatter: Record<string, any>,
  schemaProperties: Record<string, any> = {},
): FieldAnalysis {
  const schemaKeys = new Set(Object.keys(schemaProperties));
  const result: FieldAnalysis = {
    known: [],
    inferred: [],
    unknown: [],
  };

  // Analyze frontmatter fields
  for (const [key, value] of Object.entries(frontmatter)) {
    if (schemaKeys.has(key)) {
      result.known.push(key);
    } else {
      const inferredType = inferTypeFromValue(value);
      result.inferred.push({
        key,
        value,
        inferredType,
        inferredSchema: schemaFromType(inferredType, value),
      });
    }
  }

  // Find schema fields not in frontmatter
  for (const key of schemaKeys) {
    if (!(key in frontmatter)) {
      result.unknown.push(key);
    }
  }

  return result;
}

function inferTypeFromValue(value: any): string {
  if (value === null || value === undefined) return "string";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  // gray-matter parses YAML bare dates (e.g. 2024-01-15) as JS Date instances.
  if (value instanceof Date) return "date";
  if (typeof value === "string") {
    // Check for date patterns
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return "date";
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) return "datetime";
    if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value))
      return "email";
    if (/^https?:\/\//.test(value)) return "url";
    return "string";
  }
  if (Array.isArray(value)) return "array";
  if (typeof value === "object") return "object";
  return "string";
}

function inferObjectSchema(value: Record<string, any>): any {
  const properties: Record<string, any> = {};
  for (const [k, v] of Object.entries(value)) {
    const t = inferTypeFromValue(v);
    properties[k] = schemaFromType(t, v);
  }
  return { type: "object", properties };
}

function schemaFromType(type: string, value: any): any {
  switch (type) {
    case "boolean":
      return { type: "boolean" };
    case "number":
      return { type: "number" };
    case "date":
      return { type: "string", format: "date" };
    case "datetime":
      return { type: "string", format: "date-time" };
    case "email":
      return { type: "string", format: "email" };
    case "url":
      return { type: "string", format: "uri" };
    case "object":
      return value && typeof value === "object" && !Array.isArray(value)
        ? inferObjectSchema(value)
        : { type: "object", properties: {} };
    case "array": {
      if (!Array.isArray(value) || value.length === 0) {
        return { type: "array", items: { type: "string" } };
      }
      const firstItem = value[0];
      const itemType = inferTypeFromValue(firstItem);
      // Array of objects — infer properties from first item
      if (itemType === "object" && firstItem && typeof firstItem === "object") {
        // Merge keys from all items so partial objects don't hide properties
        const merged: Record<string, any> = {};
        for (const item of value) {
          if (item && typeof item === "object") {
            Object.assign(merged, item);
          }
        }
        return { type: "array", items: inferObjectSchema(merged) };
      }
      return { type: "array", items: schemaFromType(itemType, firstItem) };
    }
    default:
      return { type: "string" };
  }
}

export function getFieldStatus(
  key: string,
  analysis: FieldAnalysis,
): "known" | "inferred" | "unknown" {
  if (analysis.known.includes(key)) return "known";
  if (analysis.inferred.some((f) => f.key === key)) return "inferred";
  if (analysis.unknown.includes(key)) return "unknown";
  return "known";
}
