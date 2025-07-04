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

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/accounts" component={UserAccounts} />
        <Route path="/packages" component={HostingPackages} />
        <Route path="/files" component={FileManager} />
        <Route path="/2fa-setup" component={TwoFactorSetup} />
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
  const auth = useAuthProvider();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={auth}>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/">
            <ProtectedRoute>
              <Layout>
                <Switch>
                  <Route path="/" component={Dashboard} />
                  <Route path="/dashboard" component={Dashboard} />
                  <Route path="/users" component={UserAccounts} />
                  <Route path="/packages" component={HostingPackages} />
                  <Route path="/files" component={FileManager} />
                  <Route path="/domains">
                    <PlaceholderPage 
                      title="Domain Management" 
                      icon="fas fa-globe"
                      description="Manage your domains, subdomains, and DNS settings"
                      buttonText="Add Domain"
                    />
                  </Route>
                  <Route path="/email">
                    <PlaceholderPage 
                      title="Email Management" 
                      icon="fas fa-envelope"
                      description="Create and manage email accounts for your domains"
                      buttonText="Create Email Account"
                    />
                  </Route>
                  <Route path="/databases">
                    <PlaceholderPage 
                      title="Database Management" 
                      icon="fas fa-database"
                      description="Manage your PostgreSQL databases and users"
                      buttonText="Create Database"
                    />
                  </Route>
                  <Route path="/monitoring">
                    <PlaceholderPage 
                      title="Server Monitoring" 
                      icon="fas fa-chart-line"
                      description="Monitor server performance and resource usage"
                      buttonText="View Metrics"
                    />
                  </Route>
                  <Route path="/backups">
                    <PlaceholderPage 
                      title="Backup Management" 
                      icon="fas fa-shield-alt"
                      description="Schedule and manage your data backups"
                      buttonText="Create Backup"
                    />
                  </Route>
                  <Route path="/security">
                    <PlaceholderPage 
                      title="Security Settings" 
                      icon="fas fa-lock"
                      description="Manage SSL certificates, firewall rules, and security settings"
                      buttonText="Configure Security"
                    />
                  </Route>
                  <Route component={NotFound} />
                </Switch>
              </Layout>
            </ProtectedRoute>
          </Route>
        </Switch>
        <Toaster />
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

export default App;