import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import Dashboard from "@/pages/Dashboard";
import CriticalOccasionsPage from "@/pages/CriticalOccasionsPage";
import Settings from "@/pages/Settings";
import AdminPortal from "@/pages/AdminPortal";
import AdminLogin from "@/pages/AdminLogin";
import AdminRegister from "@/pages/AdminRegister";
import AdminAddDevice from "@/pages/AdminAddDevice";
import AdminPanel from "@/pages/AdminPanel";
import ApprovalPanel from "@/pages/ApprovalPanel";
import YetkiliLogin from "@/pages/YetkiliLogin";
import YetkiliDashboard from "@/pages/YetkiliDashboard";
import NotFound from "@/pages/not-found";
import { KPIProvider } from "@/context/KPIContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={AdminPortal} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/operasyon" component={Dashboard} />
      <Route path="/mutfak" component={Dashboard} />
      <Route path="/personel" component={Dashboard} />
      <Route path="/musteri" component={Dashboard} />
      <Route path="/critical-occasions" component={CriticalOccasionsPage} />
      <Route path="/settings" component={Settings} />
      <Route path="/admin" component={AdminPortal} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/register" component={AdminRegister} />
      <Route path="/admin/add-device" component={AdminAddDevice} />
      <Route path="/admin/panel" component={AdminPanel} />
      <Route path="/admin/approval" component={ApprovalPanel} />
      <Route path="/yetkili/login" component={YetkiliLogin} />
      <Route path="/yetkili/dashboard" component={YetkiliDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <KPIProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </KPIProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
