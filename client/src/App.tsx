import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "./hooks/useAuth";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import UserAccounts from "./pages/UserAccounts";
import HostingPackages from "./pages/HostingPackages";
import FileManager from "./pages/FileManager";
import TwoFactorSetup from "./pages/TwoFactorSetup";
import PlaceholderPage from "./pages/PlaceholderPage";
import Landing from "./pages/Landing";
import NotFound from "./pages/not-found";
import SSLCertificates from "./pages/SSLCertificates";
import AdvancedMonitoring from "./pages/AdvancedMonitoring";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Landing />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (isAuthenticated) {
    return <Dashboard />;
  }

  return <>{children}</>;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={() => <Layout><Dashboard /></Layout>} />
          <Route path="/accounts" component={() => <Layout><UserAccounts /></Layout>} />
          <Route path="/packages" component={() => <Layout><HostingPackages /></Layout>} />
          <Route path="/files" component={() => <Layout><FileManager /></Layout>} />
          <Route path="/2fa-setup" component={() => <Layout><TwoFactorSetup /></Layout>} />
          <Route path="/email" component={() => <Layout><PlaceholderPage title="Email Management" icon="fas fa-envelope" description="Create and manage email accounts, forwarders, and autoresponders" buttonText="Create Email Account" /></Layout>} />
          <Route path="/databases" component={() => <Layout><PlaceholderPage title="Database Management" icon="fas fa-database" description="Create and manage PostgreSQL databases and users" buttonText="Create Database" /></Layout>} />
          <Route path="/monitoring" component={() => <Layout><AdvancedMonitoring /></Layout>} />
          <Route path="/ssl" component={() => <Layout><SSLCertificates /></Layout>} />
          <Route path="/backups" component={() => <Layout><PlaceholderPage title="Backup Management" icon="fas fa-shield-alt" description="Schedule and manage server and account backups" buttonText="Create Backup" /></Layout>} />
          <Route path="/security" component={() => <Layout><PlaceholderPage title="Security Center" icon="fas fa-lock" description="Manage security settings and access controls" buttonText="Configure Security" /></Layout>} />
          <Route component={NotFound} />
        </>
      )}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;