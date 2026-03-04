import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  evaluateConfigText,
  type CollectionSchema,
} from "@/lib/schema-evaluator";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export const TestConfigEditor = () => {
  const [schemas, setSchemas] = useState<CollectionSchema[]>([]);
  const [configSource, setConfigSource] = useState<string>("");

  const handleEvaluate = async () => {
    try {
      // Call the imported function
      const result = await evaluateConfigText(configSource);
      setSchemas(result);
      console.log("Parsed Schemas:", result);
    } catch (error) {
      console.error("Evaluation failed:", error);
    }
  };

  return (
    <div className="flex justify-center items-center mx-auto p-4 bg-background text-foreground">
      <ScrollArea className="h-96 w-87.5  border p-4">
        <Button onClick={handleEvaluate}>Evaluate Config</Button>

        <Textarea
          value={configSource}
          className="mt-4 rounded-none"
          onChange={(e) => setConfigSource(e.target.value)}
          placeholder="Paste your content.config.ts code here..."
        />
      </ScrollArea>

      <ScrollArea className="h-96 w-87.5 border p-4">
        <h3>Results:</h3>

        <code>
          <pre>{JSON.stringify(schemas, null, 2)}</pre>
        </code>
      </ScrollArea>
    </div>
  );
};
