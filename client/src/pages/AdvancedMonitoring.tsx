
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import type { ServerStats, SecurityScan } from "@shared/schema";

export default function AdvancedMonitoring() {
  const [timeRange, setTimeRange] = useState("24h");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: serverStats } = useQuery<ServerStats>({
    queryKey: ["/api/server-stats"],
    refetchInterval: autoRefresh ? 30000 : false,
  });

  const { data: serverHistory } = useQuery<ServerStats[]>({
    queryKey: ["/api/server-stats/history", timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/server-stats/history?limit=${timeRange === "24h" ? 48 : 168}`);
      if (!response.ok) throw new Error("Failed to fetch server history");
      return response.json();
    },
  });

  const { data: latestScan } = useQuery<SecurityScan>({
    queryKey: ["/api/security/scans/latest"],
    refetchInterval: autoRefresh ? 60000 : false,
  });

  const getHealthStatus = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return { color: "bg-red-100 text-red-800", level: "Critical" };
    if (value >= thresholds.warning) return { color: "bg-yellow-100 text-yellow-800", level: "Warning" };
    return { color: "bg-green-100 text-green-800", level: "Good" };
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const calculateAverage = (data: number[]) => {
    if (data.length === 0) return 0;
    return Math.round(data.reduce((a, b) => a + b, 0) / data.length);
  };

  const cpuHistory = serverHistory?.map(stat => stat.cpuUsage) || [];
  const memoryHistory = serverHistory?.map(stat => stat.memoryUsage) || [];
  const diskHistory = serverHistory?.map(stat => stat.diskUsage) || [];

  const cpuStatus = getHealthStatus(serverStats?.cpuUsage || 0, { warning: 70, critical: 90 });
  const memoryStatus = getHealthStatus(serverStats?.memoryUsage || 0, { warning: 80, critical: 95 });
  const diskStatus = getHealthStatus(serverStats?.diskUsage || 0, { warning: 85, critical: 95 });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Advanced Monitoring</h1>
        <div className="flex items-center space-x-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <i className={`fas fa-${autoRefresh ? "pause" : "play"} mr-2`}></i>
            {autoRefresh ? "Pause" : "Resume"} Auto-refresh
          </Button>
          <div className="flex border rounded-lg">
            <Button
              variant={timeRange === "24h" ? "default" : "outline"}
              onClick={() => setTimeRange("24h")}
              className="rounded-r-none"
            >
              24h
            </Button>
            <Button
              variant={timeRange === "7d" ? "default" : "outline"}
              onClick={() => setTimeRange("7d")}
              className="rounded-l-none"
            >
              7d
            </Button>
          </div>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{serverStats?.cpuUsage || 0}%</div>
              <Badge className={cpuStatus.color}>{cpuStatus.level}</Badge>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${cpuStatus.level === "Critical" ? "bg-red-500" : cpuStatus.level === "Warning" ? "bg-yellow-500" : "bg-green-500"}`}
                  style={{ width: `${serverStats?.cpuUsage || 0}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Avg: {calculateAverage(cpuHistory)}% ({timeRange})
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{serverStats?.memoryUsage || 0}%</div>
              <Badge className={memoryStatus.color}>{memoryStatus.level}</Badge>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${memoryStatus.level === "Critical" ? "bg-red-500" : memoryStatus.level === "Warning" ? "bg-yellow-500" : "bg-green-500"}`}
                  style={{ width: `${serverStats?.memoryUsage || 0}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Avg: {calculateAverage(memoryHistory)}% ({timeRange})
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{serverStats?.diskUsage || 0}%</div>
              <Badge className={diskStatus.color}>{diskStatus.level}</Badge>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${diskStatus.level === "Critical" ? "bg-red-500" : diskStatus.level === "Warning" ? "bg-yellow-500" : "bg-green-500"}`}
                  style={{ width: `${serverStats?.diskUsage || 0}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Avg: {calculateAverage(diskHistory)}% ({timeRange})
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{serverStats?.activeUsers || 0}</div>
              <Badge className="bg-blue-100 text-blue-800">Online</Badge>
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                Uptime: {serverStats?.uptime ? formatUptime(serverStats.uptime) : "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resource Usage Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <i className="fas fa-chart-line text-4xl text-gray-400 mb-2"></i>
                <p className="text-gray-500">Performance Chart</p>
                <p className="text-sm text-gray-400">CPU, Memory, Disk usage over time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Network Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <i className="fas fa-network-wired text-4xl text-gray-400 mb-2"></i>
                <p className="text-gray-500">Network Chart</p>
                <p className="text-sm text-gray-400">Bandwidth usage and connections</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Status */}
      <Card>
        <CardHeader>
          <CardTitle>Security Status</CardTitle>
        </CardHeader>
        <CardContent>
          {latestScan ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Latest Security Scan</h3>
                  <p className="text-sm text-gray-500">
                    {latestScan.completedAt 
                      ? `Completed ${new Date(latestScan.completedAt).toLocaleString()}`
                      : `Started ${new Date(latestScan.createdAt).toLocaleString()}`
                    }
                  </p>
                </div>
                <Badge className={latestScan.threatsFound && latestScan.threatsFound > 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                  {latestScan.threatsFound || 0} Threats Found
                </Badge>
              </div>

              {latestScan.results && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900">Files Scanned</h4>
                    <p className="text-2xl font-bold text-blue-600">
                      {JSON.parse(latestScan.results).filesScanned || 0}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900">Clean Files</h4>
                    <p className="text-2xl font-bold text-green-600">
                      {JSON.parse(latestScan.results).cleanFiles || 0}
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-medium text-red-900">Threats</h4>
                    <p className="text-2xl font-bold text-red-600">
                      {latestScan.threatsFound || 0}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No security scan data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert System */}
      <Card>
        <CardHeader>
          <CardTitle>System Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(serverStats?.cpuUsage || 0) > 80 && (
              <Alert>
                <AlertDescription>
                  <i className="fas fa-exclamation-triangle text-yellow-500 mr-2"></i>
                  High CPU usage detected ({serverStats?.cpuUsage}%). Consider investigating running processes.
                </AlertDescription>
              </Alert>
            )}
            {(serverStats?.memoryUsage || 0) > 90 && (
              <Alert>
                <AlertDescription>
                  <i className="fas fa-exclamation-triangle text-red-500 mr-2"></i>
                  Critical memory usage detected ({serverStats?.memoryUsage}%). Immediate action required.
                </AlertDescription>
              </Alert>
            )}
            {(serverStats?.diskUsage || 0) > 85 && (
              <Alert>
                <AlertDescription>
                  <i className="fas fa-exclamation-triangle text-orange-500 mr-2"></i>
                  High disk usage detected ({serverStats?.diskUsage}%). Consider cleaning up files.
                </AlertDescription>
              </Alert>
            )}
            {(!serverStats?.cpuUsage || serverStats.cpuUsage < 80) && 
             (!serverStats?.memoryUsage || serverStats.memoryUsage < 90) && 
             (!serverStats?.diskUsage || serverStats.diskUsage < 85) && (
              <Alert>
                <AlertDescription>
                  <i className="fas fa-check-circle text-green-500 mr-2"></i>
                  All system resources are operating within normal parameters.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
