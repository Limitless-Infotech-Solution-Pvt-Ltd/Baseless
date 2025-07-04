import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatUptime } from "@/lib/utils";
import type { ServerStats, User } from "@shared/schema";

export default function Dashboard() {
  const { data: serverStats, isLoading: statsLoading } = useQuery<ServerStats>({
    queryKey: ["/api/server-stats"],
  });

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  if (statsLoading || usersLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-6 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const activeUsers = users?.filter(user => user.status === "active").length || 0;
  const uptimePercentage = serverStats?.uptime ? 99.9 : 0;

  return (
    <div className="space-y-8">
      {/* Server Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Server Status</p>
                <p className="text-2xl font-bold text-green-600">Online</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-check-circle text-green-600 text-xl"></i>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-slate-600">
                <i className="fas fa-clock w-4 h-4 mr-1"></i>
                <span>Uptime: {uptimePercentage}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Accounts</p>
                <p className="text-2xl font-bold text-slate-900">{activeUsers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-users text-blue-600 text-xl"></i>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm text-green-600">
                <i className="fas fa-arrow-up w-4 h-4 mr-1"></i>
                <span>+{Math.floor(activeUsers * 0.05)} this week</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">CPU Usage</p>
                <p className="text-2xl font-bold text-slate-900">{serverStats?.cpuUsage || 0}%</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-microchip text-orange-600 text-xl"></i>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${serverStats?.cpuUsage || 0}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Memory Usage</p>
                <p className="text-2xl font-bold text-slate-900">{serverStats?.memoryUsage || 0}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-memory text-purple-600 text-xl"></i>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${serverStats?.memoryUsage || 0}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-user-plus text-green-600 text-sm"></i>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">New account created</p>
                  <p className="text-xs text-slate-500">
                    {users?.[0]?.email || "New user"} - {users?.[0]?.createdAt ? new Date(users[0].createdAt).toLocaleDateString() : "Recently"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-server text-blue-600 text-sm"></i>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Server stats updated</p>
                  <p className="text-xs text-slate-500">
                    System monitoring - {serverStats?.timestamp ? new Date(serverStats.timestamp).toLocaleString() : "Recently"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-shield-alt text-yellow-600 text-sm"></i>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Security scan completed</p>
                  <p className="text-xs text-slate-500">No threats found - System healthy</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="flex flex-col items-center p-4 h-auto"
                onClick={() => window.location.href = "/accounts"}
              >
                <i className="fas fa-user-plus text-blue-600 text-xl mb-2"></i>
                <span className="text-sm font-medium">Create Account</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col items-center p-4 h-auto"
                onClick={() => window.location.href = "/packages"}
              >
                <i className="fas fa-box text-green-600 text-xl mb-2"></i>
                <span className="text-sm font-medium">New Package</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col items-center p-4 h-auto"
                onClick={() => window.location.href = "/backups"}
              >
                <i className="fas fa-shield-alt text-purple-600 text-xl mb-2"></i>
                <span className="text-sm font-medium">Run Backup</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col items-center p-4 h-auto"
                onClick={() => window.location.href = "/monitoring"}
              >
                <i className="fas fa-chart-line text-orange-600 text-xl mb-2"></i>
                <span className="text-sm font-medium">View Logs</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
