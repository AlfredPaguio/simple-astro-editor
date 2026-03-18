import { TestConfigEditor } from "@/Tester";
import MainEditor from "@/MainEditor";
import {
  // BrowserRouter,
  HashRouter,
  Routes,
  Route,
} from "react-router";
import Providers from "@/components/Providers";

export function App() {
  return (
    <Providers>
      <HashRouter>
        <Routes>
          <Route path="/" element={<MainEditor />} />
          <Route path="/tester" element={<TestConfigEditor />} />
        </Routes>
      </HashRouter>
    </Providers>
  );
}

export default App;
