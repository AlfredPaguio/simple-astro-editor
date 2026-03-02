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
    case "array":
      { const itemType =
        value.length > 0 ? inferTypeFromValue(value[0]) : "string";
      return { type: "array", items: schemaFromType(itemType, value[0]) }; }
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
