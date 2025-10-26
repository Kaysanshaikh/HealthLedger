import BrowseRouter from "./BrowseRouter";
import { ThemeProvider } from "./components/theme-provider";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <BrowseRouter />
    </ThemeProvider>
  );
}

export default App;
