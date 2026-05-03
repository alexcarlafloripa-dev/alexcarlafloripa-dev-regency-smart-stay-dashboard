/**
 * Design: Interface Tecnológica Imersiva - Glassmorphism Dark Theme
 * App principal com tema escuro e roteamento
 */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CompareProvider } from "./contexts/CompareContext";
import { CompareBar } from "./components/CompareBar";
import { ComparePanel } from "./components/ComparePanel";
import Home from "./pages/Home";
import Corretor from "./pages/Corretor";
import Analytics from "./pages/Analytics";
import AnimationPrototype from "./pages/AnimationPrototype";
import Gestor from "./pages/Gestor";
import Corretores from "./pages/Corretores";
import ContractFlowPage from "./pages/ContractFlowPage";
import Apresentacao from "./pages/Apresentacao";
import Planilha from "./pages/Planilha";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/corretor"} component={Corretor} />
      <Route path={"/analytics"} component={Analytics} />
      <Route path={"/animation-prototype"} component={AnimationPrototype} />
      <Route path={"/gestor"} component={Gestor} />
      <Route path={"/corretores"} component={Corretores} />
      <Route path={"/contratos"} component={ContractFlowPage} />
      <Route path={"/apresentacao"} component={Apresentacao} />
      <Route path={"/planilha"} component={Planilha} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <CompareProvider>
          <TooltipProvider>
            <Toaster position="top-center" duration={800} />
            <Router />
            <CompareBar />
            <ComparePanel />
          </TooltipProvider>
        </CompareProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
