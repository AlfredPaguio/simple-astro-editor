import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: [
      "zod/v4",
      "remark",
      "remark-html",
      "rehype-sanitize",
      "gray-matter",
    ],
    exclude: ["esbuild-wasm"], // Handle wasm separately
  },
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
    watch: {
      usePolling: true,
    },
  },
  build: {
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks: {
          editor: ["@uiw/react-codemirror", "@codemirror/lang-markdown"],
          preview: ["remark", "remark-html", "rehype-sanitize"],
          schema: ["zod/v4", "esbuild-wasm"],
        },
      },
    },
  },
});
