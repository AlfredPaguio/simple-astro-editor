import { createContext, useContext } from "react";

interface SchemaFormContextValue {
  onChange: (key: string, value: unknown) => void;
}

const SchemaFormContext = createContext<SchemaFormContextValue | null>(null);

export function SchemaFormProvider({
  onChange,
  children,
}: {
  onChange: (key: string, value: unknown) => void;
  children: React.ReactNode;
}) {
  return <SchemaFormContext value={{ onChange }}>{children}</SchemaFormContext>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSchemaForm(): SchemaFormContextValue {
  const ctx = useContext(SchemaFormContext);
  if (!ctx) {
    throw new Error("useSchemaForm must be used within SchemaFormProvider");
  }
  return ctx;
}