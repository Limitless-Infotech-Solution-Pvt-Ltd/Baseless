
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { SslCertificate, Domain } from "@shared/schema";

export default function SSLCertificates() {
  const [selectedDomainId, setSelectedDomainId] = useState<number | null>(null);
  const [certificateType, setCertificateType] = useState<"lets_encrypt" | "custom">("lets_encrypt");
  const [customCertificate, setCustomCertificate] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: domains } = useQuery<Domain[]>({
    queryKey: ["/api/domains"],
  });

  const { data: certificates } = useQuery<SslCertificate[]>({
    queryKey: ["/api/ssl-certificates", selectedDomainId],
    enabled: !!selectedDomainId,
    queryFn: async () => {
      const response = await fetch(`/api/ssl-certificates/${selectedDomainId}`);
      if (!response.ok) throw new Error("Failed to fetch certificates");
      return response.json();
    },
  });

  const generateCertificateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/ssl-certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to generate certificate");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ssl-certificates"] });
      toast({ title: "Success", description: "SSL certificate generation started" });
    },
  });

  const handleGenerateCertificate = async () => {
    if (!selectedDomainId) return;

    const certificateData = {
      domainId: selectedDomainId,
      userId: 1, // Current user
      type: certificateType,
      certificate: certificateType === "custom" ? customCertificate : undefined,
      privateKey: certificateType === "custom" ? privateKey : undefined,
    };

    try {
      await generateCertificateMutation.mutateAsync(certificateData);
      setCustomCertificate("");
      setPrivateKey("");
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate certificate", variant: "destructive" });
    }
  };

  const getCertificateStatus = (cert: SslCertificate) => {
    const now = new Date();
    const validTo = new Date(cert.validTo || 0);
    const daysUntilExpiry = Math.ceil((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (cert.status === "pending") return { color: "bg-yellow-100 text-yellow-800", text: "Pending" };
    if (cert.status === "failed") return { color: "bg-red-100 text-red-800", text: "Failed" };
    if (daysUntilExpiry <= 0) return { color: "bg-red-100 text-red-800", text: "Expired" };
    if (daysUntilExpiry <= 30) return { color: "bg-orange-100 text-orange-800", text: "Expiring Soon" };
    return { color: "bg-green-100 text-green-800", text: "Active" };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">SSL Certificates</h1>
        <Button onClick={() => window.location.reload()}>
          <i className="fas fa-sync mr-2"></i>
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generate Certificate */}
        <Card>
          <CardHeader>
            <CardTitle>Generate SSL Certificate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Domain</Label>
              <select
                value={selectedDomainId || ""}
                onChange={(e) => setSelectedDomainId(Number(e.target.value) || null)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select a domain</option>
                {domains?.map((domain) => (
                  <option key={domain.id} value={domain.id}>
                    {domain.domain}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Certificate Type</Label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="certificateType"
                    value="lets_encrypt"
                    checked={certificateType === "lets_encrypt"}
                    onChange={(e) => setCertificateType(e.target.value as "lets_encrypt")}
                    className="mr-2"
                  />
                  Let's Encrypt (Free)
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="certificateType"
                    value="custom"
                    checked={certificateType === "custom"}
                    onChange={(e) => setCertificateType(e.target.value as "custom")}
                    className="mr-2"
                  />
                  Custom Certificate
                </label>
              </div>
            </div>

            {certificateType === "custom" && (
              <>
                <div className="space-y-2">
                  <Label>Certificate (PEM format)</Label>
                  <textarea
                    value={customCertificate}
                    onChange={(e) => setCustomCertificate(e.target.value)}
                    placeholder="-----BEGIN CERTIFICATE-----"
                    className="w-full p-2 border rounded-md h-32 font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Private Key (PEM format)</Label>
                  <textarea
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    placeholder="-----BEGIN PRIVATE KEY-----"
                    className="w-full p-2 border rounded-md h-32 font-mono text-sm"
                  />
                </div>
              </>
            )}

            <Button
              onClick={handleGenerateCertificate}
              disabled={!selectedDomainId || generateCertificateMutation.isPending}
              className="w-full"
            >
              <i className="fas fa-certificate mr-2"></i>
              {generateCertificateMutation.isPending ? "Generating..." : "Generate Certificate"}
            </Button>

            {certificateType === "lets_encrypt" && (
              <Alert>
                <AlertDescription>
                  Let's Encrypt certificates are free and automatically renewed every 90 days.
                  Make sure your domain is pointing to this server.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Certificate List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDomainId ? `Certificates for ${domains?.find(d => d.id === selectedDomainId)?.domain}` : "Select a domain to view certificates"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {certificates && certificates.length > 0 ? (
              <div className="space-y-4">
                {certificates.map((cert) => {
                  const status = getCertificateStatus(cert);
                  return (
                    <div key={cert.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{cert.type === "lets_encrypt" ? "Let's Encrypt" : "Custom Certificate"}</h3>
                          <p className="text-sm text-gray-500">{cert.issuer}</p>
                        </div>
                        <Badge className={status.color}>{status.text}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Valid From</p>
                          <p>{cert.validFrom ? new Date(cert.validFrom).toLocaleDateString() : "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Valid To</p>
                          <p>{cert.validTo ? new Date(cert.validTo).toLocaleDateString() : "N/A"}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {cert.autoRenew && (
                            <Badge variant="outline">Auto-Renewal Enabled</Badge>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <i className="fas fa-download mr-1"></i>
                            Download
                          </Button>
                          <Button variant="outline" size="sm">
                            <i className="fas fa-sync mr-1"></i>
                            Renew
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : selectedDomainId ? (
              <div className="text-center py-8 text-gray-500">
                No certificates found for this domain
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Select a domain to view its certificates
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
