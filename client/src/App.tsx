import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthContext, useAuthProvider } from "./hooks/useAuth";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import UserAccounts from "./pages/UserAccounts";
import HostingPackages from "./pages/HostingPackages";
import FileManager from "./pages/FileManager";
import TwoFactorSetup from "./pages/TwoFactorSetup";
import PlaceholderPage from "./pages/PlaceholderPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/not-found";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthProvider();
  const [, setLocation] = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthProvider();
  const [, setLocation] = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (user) {
    setLocation("/");
    return null;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/accounts" component={UserAccounts} />
        <Route path="/packages" component={HostingPackages} />
        <Route path="/files" component={FileManager} />
        <Route path="/2fa-setup" component={TwoFactorSetup} />
        <Route path="/domains" component={lazy(() => import("./pages/DomainManagement"))} />
        <Route path="/webmail" component={lazy(() => import("./pages/Webmail"))} />
        <Route path="/code-editor" component={lazy(() => import("./pages/BaselessCode"))} />
        <Route path="/email" component={() => <PlaceholderPage title="Email Management" icon="fas fa-envelope" description="Create and manage email accounts, forwarders, and autoresponders" buttonText="Create Email Account" />} />
        <Route path="/databases" component={() => <PlaceholderPage title="Database Management" icon="fas fa-database" description="Create and manage PostgreSQL databases and users" buttonText="Create Database" />} />
        <Route path="/monitoring" component={() => <PlaceholderPage title="Resource Monitoring" icon="fas fa-chart-bar" description="Monitor server resources and user account usage" buttonText="View Reports" />} />
        <Route path="/backups" component={() => <PlaceholderPage title="Backup Management" icon="fas fa-shield-alt" description="Schedule and manage server and account backups" buttonText="Create Backup" />} />
        <Route path="/security" component={() => <PlaceholderPage title="Security Center" icon="fas fa-lock" description="Manage security settings and access controls" buttonText="Configure Security" />} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  const auth = useAuthProvider();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={auth}>
        <Switch>
          <Route path="/login">
            <PublicRoute>
              <Login />
            </PublicRoute>
          </Route>
          <Route path="/register">
            <PublicRoute>
              <Register />
            </PublicRoute>
          </Route>
          <Route>
            <ProtectedRoute>
              <Router />
            </ProtectedRoute>
          </Route>
        </Switch>
        <Toaster />
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

export default App;