import { TestConfigEditor } from "@/Tester";
import MainEditor from "@/MainEditor";
import {
  BrowserRouter,
  // HashRouter,
  Routes,
  Route,
} from "react-router";
import Providers from "@/components/Providers";

export function App() {
  return (
    <Providers>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainEditor />} />
          <Route path="/tester" element={<TestConfigEditor />} />
        </Routes>
      </BrowserRouter>
    </Providers>
  );
}

export default App;
