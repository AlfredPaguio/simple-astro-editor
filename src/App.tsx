import { ThemeProvider } from "./components/theme-provider";
import { TooltipProvider } from "./components/ui/tooltip";
import MainEditor from "@/MainEditor";

export function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider>
        <MainEditor />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
