
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import type { Domain, DnsRecord, SslCertificate } from "@shared/schema";

const domainSchema = z.object({
  domain: z.string().min(1, "Domain is required"),
  type: z.enum(["primary", "addon", "subdomain", "alias"]),
});

const dnsRecordSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["A", "AAAA", "CNAME", "MX", "TXT", "NS"]),
  value: z.string().min(1, "Value is required"),
  priority: z.number().optional(),
  ttl: z.number().default(3600),
});

export default function DomainManagement() {
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: domains = [], isLoading: domainsLoading } = useQuery<Domain[]>({
    queryKey: ["/api/domains"],
  });

  const { data: dnsRecords = [] } = useQuery<DnsRecord[]>({
    queryKey: ["/api/dns-records", selectedDomain?.id],
    enabled: !!selectedDomain,
  });

  const { data: sslCertificates = [] } = useQuery<SslCertificate[]>({
    queryKey: ["/api/ssl-certificates", selectedDomain?.id],
    enabled: !!selectedDomain,
  });

  const domainForm = useForm({
    resolver: zodResolver(domainSchema),
    defaultValues: {
      domain: "",
      type: "primary" as const,
    },
  });

  const dnsForm = useForm({
    resolver: zodResolver(dnsRecordSchema),
    defaultValues: {
      name: "",
      type: "A" as const,
      value: "",
      ttl: 3600,
    },
  });

  const createDomainMutation = useMutation({
    mutationFn: async (data: z.infer<typeof domainSchema>) => {
      const response = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, userId: 1 }), // Replace with actual user ID
      });
      if (!response.ok) throw new Error("Failed to create domain");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/domains"] });
      toast({ title: "Domain added successfully" });
      domainForm.reset();
    },
  });

  const createDnsRecordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof dnsRecordSchema>) => {
      const response = await fetch("/api/dns-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          domainId: selectedDomain?.id,
          userId: 1, // Replace with actual user ID
        }),
      });
      if (!response.ok) throw new Error("Failed to create DNS record");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dns-records", selectedDomain?.id] });
      toast({ title: "DNS record added successfully" });
      dnsForm.reset();
    },
  });

  const generateSslMutation = useMutation({
    mutationFn: async (domainId: number) => {
      const response = await fetch("/api/ssl-certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domainId,
          userId: 1, // Replace with actual user ID
          type: "lets_encrypt",
        }),
      });
      if (!response.ok) throw new Error("Failed to generate SSL certificate");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ssl-certificates", selectedDomain?.id] });
      toast({ title: "SSL certificate generation started" });
    },
  });

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Domain Management</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <i className="fas fa-plus mr-2"></i>
              Add Domain
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Domain</DialogTitle>
            </DialogHeader>
            <form onSubmit={domainForm.handleSubmit((data) => createDomainMutation.mutate(data))} className="space-y-4">
              <div>
                <Label htmlFor="domain">Domain Name</Label>
                <Input {...domainForm.register("domain")} placeholder="example.com" />
              </div>
              <div>
                <Label htmlFor="type">Domain Type</Label>
                <Select onValueChange={(value) => domainForm.setValue("type", value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select domain type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">Primary Domain</SelectItem>
                    <SelectItem value="addon">Addon Domain</SelectItem>
                    <SelectItem value="subdomain">Subdomain</SelectItem>
                    <SelectItem value="alias">Domain Alias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={createDomainMutation.isPending}>
                {createDomainMutation.isPending ? "Adding..." : "Add Domain"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Domains List */}
        <Card>
          <CardHeader>
            <CardTitle>Domains</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {domains.map((domain) => (
                <div
                  key={domain.id}
                  className={`p-3 border rounded cursor-pointer transition-colors ${
                    selectedDomain?.id === domain.id ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedDomain(domain)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{domain.domain}</span>
                    <Badge variant={domain.status === "active" ? "default" : "secondary"}>
                      {domain.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500 capitalize">{domain.type}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Domain Details */}
        <div className="lg:col-span-2">
          {selectedDomain ? (
            <Tabs defaultValue="dns" className="space-y-4">
              <TabsList>
                <TabsTrigger value="dns">DNS Records</TabsTrigger>
                <TabsTrigger value="ssl">SSL Certificates</TabsTrigger>
                <TabsTrigger value="subdomains">Subdomains</TabsTrigger>
              </TabsList>

              <TabsContent value="dns">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>DNS Records for {selectedDomain.domain}</CardTitle>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm">Add Record</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add DNS Record</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={dnsForm.handleSubmit((data) => createDnsRecordMutation.mutate(data))} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="name">Name</Label>
                                <Input {...dnsForm.register("name")} placeholder="www or @" />
                              </div>
                              <div>
                                <Label htmlFor="type">Type</Label>
                                <Select onValueChange={(value) => dnsForm.setValue("type", value as any)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="A">A</SelectItem>
                                    <SelectItem value="AAAA">AAAA</SelectItem>
                                    <SelectItem value="CNAME">CNAME</SelectItem>
                                    <SelectItem value="MX">MX</SelectItem>
                                    <SelectItem value="TXT">TXT</SelectItem>
                                    <SelectItem value="NS">NS</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="value">Value</Label>
                              <Input {...dnsForm.register("value")} placeholder="192.168.1.1" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="ttl">TTL (seconds)</Label>
                                <Input {...dnsForm.register("ttl", { valueAsNumber: true })} type="number" defaultValue={3600} />
                              </div>
                              <div>
                                <Label htmlFor="priority">Priority (MX only)</Label>
                                <Input {...dnsForm.register("priority", { valueAsNumber: true })} type="number" />
                              </div>
                            </div>
                            <Button type="submit" disabled={createDnsRecordMutation.isPending}>
                              {createDnsRecordMutation.isPending ? "Adding..." : "Add Record"}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dnsRecords.map((record) => (
                        <div key={record.id} className="flex justify-between items-center p-3 border rounded">
                          <div>
                            <div className="font-medium">{record.name}.{selectedDomain.domain}</div>
                            <div className="text-sm text-gray-500">
                              {record.type} → {record.value} (TTL: {record.ttl}s)
                            </div>
                          </div>
                          <Badge variant={record.status === "active" ? "default" : "secondary"}>
                            {record.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ssl">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>SSL Certificates</CardTitle>
                      <Button 
                        size="sm" 
                        onClick={() => generateSslMutation.mutate(selectedDomain.id)}
                        disabled={generateSslMutation.isPending}
                      >
                        {generateSslMutation.isPending ? "Generating..." : "Generate SSL"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {sslCertificates.map((cert) => (
                        <div key={cert.id} className="p-4 border rounded">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{cert.type.replace("_", " ").toUpperCase()}</div>
                              <div className="text-sm text-gray-500">
                                Valid: {cert.validFrom ? new Date(cert.validFrom).toLocaleDateString() : "N/A"} - {cert.validTo ? new Date(cert.validTo).toLocaleDateString() : "N/A"}
                              </div>
                              {cert.issuer && <div className="text-sm text-gray-500">Issuer: {cert.issuer}</div>}
                            </div>
                            <Badge variant={cert.status === "active" ? "default" : cert.status === "expired" ? "destructive" : "secondary"}>
                              {cert.status}
                            </Badge>
                          </div>
                          {cert.autoRenew && (
                            <Badge variant="outline" className="mt-2">Auto-Renew Enabled</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="subdomains">
                <Card>
                  <CardHeader>
                    <CardTitle>Subdomain Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      <i className="fas fa-sitemap text-4xl mb-4"></i>
                      <p>Subdomain management coming soon</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <i className="fas fa-globe text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-500">Select a domain to manage its settings</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
