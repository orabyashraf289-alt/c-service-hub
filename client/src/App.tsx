import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import CaseWorkspace from "./pages/CaseWorkspace";
import Administration from "./pages/Administration";
import ExperienceWorkspace from "./pages/ExperienceWorkspace";
import WorkflowBuilder from "./pages/WorkflowBuilder";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/cases" component={CaseWorkspace} />
      <Route path="/portal">{() => <ExperienceWorkspace mode="customer" />}</Route>
      <Route path="/agent">{() => <ExperienceWorkspace mode="agent" />}</Route>
      <Route path="/admin" component={Administration} />
      <Route path="/automation" component={WorkflowBuilder} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="bottom-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
