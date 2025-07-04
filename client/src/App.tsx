import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import UserAccounts from "@/pages/UserAccounts";
import HostingPackages from "@/pages/HostingPackages";
import FileManager from "@/pages/FileManager";
import PlaceholderPage from "@/pages/PlaceholderPage";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/accounts" component={UserAccounts} />
        <Route path="/packages" component={HostingPackages} />
        <Route path="/files" component={FileManager} />
        <Route path="/domains" component={() => <PlaceholderPage title="Domain Management" icon="fas fa-globe" description="Manage domains, subdomains, and DNS settings" buttonText="Add Domain" />} />
        <Route path="/email" component={() => <PlaceholderPage title="Email Management" icon="fas fa-envelope" description="Create and manage email accounts, forwarders, and autoresponders" buttonText="Create Email Account" />} />
        <Route path="/databases" component={() => <PlaceholderPage title="Database Management" icon="fas fa-database" description="Create and manage PostgreSQL databases and users" buttonText="Create Database" />} />
        <Route path="/monitoring" component={() => <PlaceholderPage title="Resource Monitoring" icon="fas fa-chart-bar" description="Monitor server resources and user account usage" buttonText="View Reports" />} />
        <Route path="/backups" component={() => <PlaceholderPage title="Backup Management" icon="fas fa-shield-alt" description="Schedule and manage server and account backups" buttonText="Create Backup" />} />
        <Route path="/security" component={() => <PlaceholderPage title="Security Center" icon="fas fa-lock" description="Configure security settings, firewall, and access controls" buttonText="Security Settings" />} />
        <Route component={() => <PlaceholderPage title="Page Not Found" icon="fas fa-exclamation-triangle" description="The page you're looking for doesn't exist" buttonText="Go to Dashboard" />} />
      </Switch>
    </Layout>
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
