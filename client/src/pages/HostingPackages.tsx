import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertHostingPackageSchema } from "@shared/schema";
import { apiCall, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { HostingPackage, User } from "@shared/schema";
import { z } from "zod";

const createPackageSchema = insertHostingPackageSchema.extend({
  diskSpace: z.coerce.number().min(1, "Disk space must be at least 1GB"),
  bandwidth: z.coerce.number().min(-1, "Bandwidth must be -1 (unlimited) or positive"),
  emailAccounts: z.coerce.number().min(-1, "Email accounts must be -1 (unlimited) or positive"),
  databases: z.coerce.number().min(-1, "Databases must be -1 (unlimited) or positive"),
  domains: z.coerce.number().min(1, "Domains must be at least 1"),
});

type CreatePackageData = z.infer<typeof createPackageSchema>;

export default function HostingPackages() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: packages, isLoading: packagesLoading } = useQuery<HostingPackage[]>({
    queryKey: ["/api/hosting-packages"],
  });

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const createPackageMutation = useMutation({
    mutationFn: async (data: CreatePackageData) => {
      return await apiCall("/api/hosting-packages", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hosting-packages"] });
      toast({
        title: "Package created successfully",
        description: "The new hosting package has been created.",
      });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error creating package",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deletePackageMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiCall(`/api/hosting-packages/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hosting-packages"] });
      toast({
        title: "Package deleted successfully",
        description: "The hosting package has been deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting package",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<CreatePackageData>({
    resolver: zodResolver(createPackageSchema),
    defaultValues: {
      name: "",
      diskSpace: 1,
      bandwidth: 10,
      emailAccounts: 5,
      databases: 2,
      domains: 1,
      status: "active",
    },
  });

  const getUserCount = (packageId: number) => {
    return users?.filter(user => user.packageId === packageId).length || 0;
  };

  const handleDeletePackage = (packageId: number) => {
    const userCount = getUserCount(packageId);
    if (userCount > 0) {
      toast({
        title: "Cannot delete package",
        description: `This package is being used by ${userCount} user${userCount > 1 ? 's' : ''}. Please reassign users before deleting.`,
        variant: "destructive",
      });
      return;
    }

    if (window.confirm("Are you sure you want to delete this package? This action cannot be undone.")) {
      deletePackageMutation.mutate(packageId);
    }
  };

  const formatValue = (value: number, unit: string) => {
    return value === -1 ? "Unlimited" : `${value}${unit}`;
  };

  if (packagesLoading || usersLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Hosting Packages</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <i className="fas fa-plus w-4 h-4 mr-2"></i>
              Create Package
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Hosting Package</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createPackageMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Package Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. Premium" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="diskSpace"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Disk Space (GB)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" placeholder="10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bandwidth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bandwidth (GB, -1 = Unlimited)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" placeholder="100" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="emailAccounts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Accounts (-1 = Unlimited)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" placeholder="10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="databases"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Databases (-1 = Unlimited)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" placeholder="5" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="domains"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Domains</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="1" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createPackageMutation.isPending}>
                    {createPackageMutation.isPending ? "Creating..." : "Create Package"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages?.map((pkg) => (
          <Card key={pkg.id} className="package-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{pkg.name}</CardTitle>
                <Badge className={pkg.status === "active" ? "status-active" : "status-inactive"}>
                  {pkg.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Disk Space</span>
                  <span className="text-sm font-medium text-slate-900">{formatValue(pkg.diskSpace, "GB")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Bandwidth</span>
                  <span className="text-sm font-medium text-slate-900">{formatValue(pkg.bandwidth, "GB")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Email Accounts</span>
                  <span className="text-sm font-medium text-slate-900">{formatValue(pkg.emailAccounts, "")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Databases</span>
                  <span className="text-sm font-medium text-slate-900">{formatValue(pkg.databases, "")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Domains</span>
                  <span className="text-sm font-medium text-slate-900">{pkg.domains}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Users: {getUserCount(pkg.id)}</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="link"
                    size="sm"
                    className="text-blue-600 hover:text-blue-900 p-0"
                    onClick={() => {/* TODO: Edit package dialog */}}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="link"
                    size="sm"
                    className="text-red-600 hover:text-red-900 p-0"
                    onClick={() => handleDeletePackage(pkg.id)}
                    disabled={deletePackageMutation.isPending}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {packages?.length === 0 && (
        <div className="text-center py-12">
          <i className="fas fa-box text-4xl text-slate-400 mb-4"></i>
          <p className="text-slate-600 mb-4">No hosting packages available.</p>
          <Button onClick={() => setDialogOpen(true)}>
            Create Your First Package
          </Button>
        </div>
      )}
    </div>
  );
}
