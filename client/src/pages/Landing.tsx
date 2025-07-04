import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, Shield, Zap, Database, HardDrive, Globe } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Baseless
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
            The easiest hosting control panel for modern web applications
          </p>
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
            onClick={() => window.location.href = '/api/login'}
          >
            Get Started
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <Server className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Server Management</CardTitle>
              <CardDescription>
                Complete control over your hosting environment with real-time monitoring
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <Globe className="mx-auto h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Domain Management</CardTitle>
              <CardDescription>
                Easy domain configuration, DNS management, and SSL certificate handling
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <Database className="mx-auto h-12 w-12 text-purple-600 mb-4" />
              <CardTitle>Database Management</CardTitle>
              <CardDescription>
                Powerful database tools with automated backups and optimization
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <HardDrive className="mx-auto h-12 w-12 text-orange-600 mb-4" />
              <CardTitle>File Management</CardTitle>
              <CardDescription>
                Intuitive file browser with upload, download, and editing capabilities
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <Shield className="mx-auto h-12 w-12 text-red-600 mb-4" />
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Advanced security features including two-factor authentication
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <Zap className="mx-auto h-12 w-12 text-yellow-600 mb-4" />
              <CardTitle>Performance</CardTitle>
              <CardDescription>
                Optimized for speed with caching, CDN integration, and monitoring
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto border-0 shadow-lg bg-blue-50 dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to get started?</CardTitle>
              <CardDescription className="text-lg">
                Join thousands of developers who trust Baseless for their hosting needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
                onClick={() => window.location.href = '/api/login'}
              >
                Sign In to Get Started
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}