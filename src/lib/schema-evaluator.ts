/* eslint-disable @typescript-eslint/no-explicit-any */
import * as esbuild from "esbuild-wasm/esm/browser.js";
import { z } from "zod";

// Mock astro:content for browser execution
const ASTRO_CONTENT_MOCK = {
  defineCollection: (config: any) => config,
  defineLiveCollection: (config: any) => config,
  defineConfig: (config: any) => config,
  z, // Astro re-exports Zod
  // reference: (config: any) => config,
  reference: () => z.string().describe("Reference to another collection"),

  getCollection: (config: any) => config,
  getEntry: (config: any) => config,
  getEntries: (config: any) => config,
  render: (config: any) => config,
};

let esbuildInitialized = false;

export async function initializeEsbuild() {
  if (esbuildInitialized) return;

  await esbuild.initialize({
    wasmURL: "/esbuild.wasm",
    worker: false, // Run in main thread for simplicity
  });

  esbuildInitialized = true;
}

export interface CollectionSchema {
  name: string;
  jsonSchema: any;
  error?: string;
}

export async function evaluateConfigText(
  source: string,
): Promise<CollectionSchema[]> {
  await initializeEsbuild();

  try {
    // Transpile TypeScript → JavaScript using CommonJS format so imports become require() calls
    const transpiled = await esbuild.transform(source, {
      loader: "ts",
      target: "es2020",
      format: "cjs",
      sourcemap: false,
      minify: false,
    });

    // Execute in controlled scope with mocked globals and require function
    const collections = executeInSandbox(transpiled.code);

    // Convert Zod schemas → JSON Schema
    const schemas: CollectionSchema[] = [];

    if (collections && typeof collections === "object") {
      for (const [name, collection] of Object.entries(collections)) {
        try {
          let schemaObj = (collection as any).schema || collection;

          // Handle schema functions - call with context
          if (typeof schemaObj === "function") {
            const context = {
              image: createMockImageHelper(),
            };
            schemaObj = schemaObj(context);
          }

          // Basic inferencing to generic JSON schema if zod-to-json-schema is missing.
          let jsonSchema = { type: "object", properties: {} };
          if (schemaObj && typeof schemaObj.toJSONSchema === "function") {
            jsonSchema = schemaObj.toJSONSchema({
              target: "draft-2020-12",
              unrepresentable: "any",
              io: "input",
            });
          }

          schemas.push({
            name,
            jsonSchema,
          });
        } catch (err) {
          schemas.push({
            name,
            jsonSchema: { type: "object", properties: {} },
            error: err instanceof Error ? err.message : "Unknown error",
          });
        }
      }
    }

    return schemas;
  } catch (err) {
    console.error("Schema evaluation failed:", err);
    throw new Error(
      `Failed to parse content.config.ts: ${err instanceof Error ? err.message : "Unknown error"}`,
    );
  }
}

// Mock image helper function for browser environment
function createMockImageHelper() {
  return () => {
    // Return a Zod schema that represents an image
    // In a real Astro environment, this would validate image imports
    return z.object({
      src: z.string(),
      width: z.number().optional(),
      height: z.number().optional(),
      format: z.string().optional(),
    });
  };
}

function executeInSandbox(code: string): any {
  // Create a controlled execution environment
  const sandbox = {
    require: (pkg: string) => {
      if (pkg === "astro:content") {
        return {
          ...ASTRO_CONTENT_MOCK,
          // Add image to the context for schema functions
          image: createMockImageHelper(),
        };
      }
      if (pkg === "zod" || pkg === "astro/zod") {
        // esbuild's CJS to ESM interop (__toESM) checks for __esModule and reads default/named exports
        // Zod functions fail if bound to proxies, so we must return a clean object with z mapped.
        return { ...z, default: z, z, __esModule: true };
      }
      if (pkg === "astro/loaders")
        return { glob: () => ({}), file: () => ({}), __esModule: true };
      console.warn(
        `Module "${pkg}" is not natively supported in the config sandbox, returning a generic proxy.`,
      );
      return new Proxy(
        {},
        {
          get() {
            return () => ({});
          },
        },
      );
    },
    console,
    Object,
    Array,
    String,
    Number,
    Boolean,
    Date,
    RegExp,
    Map,
    Set,
    JSON,
    Math,
  };

  const execute = new Function(`
    with (this) {
      const exports = {};
      const module = { exports };
      ${code}
      // Depending on the file's export style (export const collections = ...)
      return module.exports.collections || exports.collections || exports.default || module.exports;
    }
  `);

  return execute.call(sandbox);
}
