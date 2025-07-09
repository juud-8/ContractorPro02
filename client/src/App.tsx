import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import MainLayout from "@/components/layout/main-layout";
import Dashboard from "@/pages/dashboard";
import Invoices from "@/pages/invoices";
import Quotes from "@/pages/quotes";
import Customers from "@/pages/customers";
import Payments from "@/pages/payments";
import Expenses from "@/pages/expenses";
import TimeTracking from "@/pages/time-tracking";
import Tasks from "@/pages/tasks";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import Notifications from "@/pages/notifications";
import Teams from "@/pages/teams";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/invoices" component={Invoices} />
        <Route path="/quotes" component={Quotes} />
        <Route path="/customers" component={Customers} />
        <Route path="/payments" component={Payments} />
        <Route path="/expenses" component={Expenses} />
        <Route path="/time-tracking" component={TimeTracking} />
        <Route path="/tasks" component={Tasks} />
        <Route path="/reports" component={Reports} />
        <Route path="/settings" component={Settings} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/teams" component={Teams} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
