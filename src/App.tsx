import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import TinaManagement from "./pages/TinaManagement";
import SensorManagement from "./pages/SensorManagement";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import SensorConfigManagement from "./pages/SensorConfigManagement";
import AlertasManagement from '@/pages/AlertasManagement';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tinas" element={<TinaManagement />} />
              <Route path="/sensores" element={<SensorManagement />} />
              <Route path="/configuraciones" element={<SensorConfigManagement />} />
              <Route path="/alertas" element={<AlertasManagement />} />
              <Route path="/usuarios" element={<UserManagement />} />
              <Route path="/reportes" element={<Reports />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
