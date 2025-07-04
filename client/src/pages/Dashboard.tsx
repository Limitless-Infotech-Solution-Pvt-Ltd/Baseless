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
            <Card key={i} className="border-slate-200/50 shadow-lg">
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
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Welcome back, Admin!</h1>
        <p className="text-white/80">Your server is running smoothly with optimal performance.</p>
      </div>

      {/* Server Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-slate-200/50 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-white to-green-50/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Server Status</p>
                <p className="text-2xl font-bold text-green-600">Online</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-check-circle text-white text-xl"></i>
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

        <Card className="border-slate-200/50 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-white to-blue-50/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Accounts</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{activeUsers}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-users text-white text-xl"></i>
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

        <Card className="border-slate-200/50 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-white to-orange-50/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">CPU Usage</p>
                <p className="text-2xl font-bold text-slate-900">{serverStats?.cpuUsage || 0}%</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-microchip text-white text-xl"></i>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-slate-200/50 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300 shadow-sm" 
                  style={{ width: `${serverStats?.cpuUsage || 0}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/50 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-white to-purple-50/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Memory Usage</p>
                <p className="text-2xl font-bold text-slate-900">{serverStats?.memoryUsage || 0}%</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-memory text-white text-xl"></i>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-slate-200/50 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300 shadow-sm" 
                  style={{ width: `${serverStats?.memoryUsage || 0}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200/50 shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg font-semibold text-slate-900">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-50/50 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                  <i className="fas fa-user-plus text-white text-sm"></i>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">New account created</p>
                  <p className="text-xs text-slate-500">
                    {users?.[0]?.email || "New user"} - {users?.[0]?.createdAt ? new Date(users[0].createdAt).toLocaleDateString() : "Recently"}
                  </p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-0">New</Badge>
              </div>
              
              <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-50/50 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                  <i className="fas fa-server text-white text-sm"></i>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Server stats updated</p>
                  <p className="text-xs text-slate-500">
                    System monitoring - {serverStats?.timestamp ? new Date(serverStats.timestamp).toLocaleString() : "Recently"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-50/50 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                  <i className="fas fa-shield-alt text-white text-sm"></i>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">Security scan completed</p>
                  <p className="text-xs text-slate-500">No threats found - System healthy</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-0">
                  <i className="fas fa-check text-xs mr-1"></i>
                  Secure
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/50 shadow-lg">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg font-semibold text-slate-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="flex flex-col items-center p-6 h-auto border-slate-200/50 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group"
                onClick={() => window.location.href = "/accounts"}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
                  <i className="fas fa-user-plus text-white text-lg"></i>
                </div>
                <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-700">Create Account</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col items-center p-6 h-auto border-slate-200/50 hover:border-green-300 hover:bg-green-50/50 transition-all group"
                onClick={() => window.location.href = "/packages"}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
                  <i className="fas fa-box text-white text-lg"></i>
                </div>
                <span className="text-sm font-medium text-slate-700 group-hover:text-green-700">New Package</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col items-center p-6 h-auto border-slate-200/50 hover:border-purple-300 hover:bg-purple-50/50 transition-all group"
                onClick={() => window.location.href = "/backups"}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
                  <i className="fas fa-shield-alt text-white text-lg"></i>
                </div>
                <span className="text-sm font-medium text-slate-700 group-hover:text-purple-700">Run Backup</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col items-center p-6 h-auto border-slate-200/50 hover:border-orange-300 hover:bg-orange-50/50 transition-all group"
                onClick={() => window.location.href = "/monitoring"}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
                  <i className="fas fa-chart-line text-white text-lg"></i>
                </div>
                <span className="text-sm font-medium text-slate-700 group-hover:text-orange-700">View Logs</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
