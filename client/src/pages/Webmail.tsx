
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { EmailAccount, WebmailSettings } from "@shared/schema";

interface Email {
  id: number;
  from: string;
  to: string;
  subject: string;
  body: string;
  isRead: boolean;
  isStarred: boolean;
  timestamp: string;
  attachments?: string[];
}

export default function Webmail() {
  const [selectedFolder, setSelectedFolder] = useState("inbox");
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [composeData, setComposeData] = useState({
    to: "",
    cc: "",
    bcc: "",
    subject: "",
    body: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock email data
  const mockEmails: Email[] = [
    {
      id: 1,
      from: "support@example.com",
      to: "user@baseless.com",
      subject: "Welcome to Baseless Hosting",
      body: "Thank you for choosing Baseless Hosting! Your account has been successfully created.",
      isRead: false,
      isStarred: false,
      timestamp: new Date().toISOString(),
    },
    {
      id: 2,
      from: "noreply@updates.com",
      to: "user@baseless.com",
      subject: "Security Update Available",
      body: "A new security update is available for your hosting account. Please review the changes.",
      isRead: true,
      isStarred: true,
      timestamp: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 3,
      from: "billing@baseless.com",
      to: "user@baseless.com",
      subject: "Monthly Billing Statement",
      body: "Your monthly billing statement is now available. Please review your usage and charges.",
      isRead: true,
      isStarred: false,
      timestamp: new Date(Date.now() - 172800000).toISOString(),
    },
  ];

  const { data: emailAccounts } = useQuery<EmailAccount[]>({
    queryKey: ["/api/email-accounts/user/1"],
  });

  const { data: webmailSettings } = useQuery<WebmailSettings>({
    queryKey: ["/api/webmail/settings"],
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (emailData: any) => {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Email sent successfully" });
      setIsComposing(false);
      setComposeData({ to: "", cc: "", bcc: "", subject: "", body: "" });
    },
  });

  const folders = [
    { id: "inbox", name: "Inbox", icon: "fas fa-inbox", count: mockEmails.filter(e => !e.isRead).length },
    { id: "sent", name: "Sent", icon: "fas fa-paper-plane", count: 0 },
    { id: "drafts", name: "Drafts", icon: "fas fa-file-alt", count: 0 },
    { id: "starred", name: "Starred", icon: "fas fa-star", count: mockEmails.filter(e => e.isStarred).length },
    { id: "trash", name: "Trash", icon: "fas fa-trash", count: 0 },
  ];

  const handleSendEmail = async () => {
    if (!composeData.to || !composeData.subject) {
      toast({ title: "Error", description: "Please fill in required fields", variant: "destructive" });
      return;
    }

    try {
      await sendEmailMutation.mutateAsync(composeData);
    } catch (error) {
      toast({ title: "Error", description: "Failed to send email", variant: "destructive" });
    }
  };

  const filteredEmails = mockEmails.filter(email => {
    const matchesSearch = !searchQuery || 
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.body.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFolder = selectedFolder === "inbox" || 
      (selectedFolder === "starred" && email.isStarred);
    
    return matchesSearch && matchesFolder;
  });

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Webmail</h1>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <Input
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button onClick={() => setIsComposing(true)}>
              <i className="fas fa-plus mr-2"></i>
              Compose
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <i className="fas fa-sync mr-2"></i>
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r bg-gray-50 flex flex-col">
          <div className="p-4">
            <h2 className="font-semibold mb-4">Folders</h2>
            <div className="space-y-1">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                    selectedFolder === folder.id
                      ? "bg-blue-100 text-blue-700"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center">
                    <i className={`${folder.icon} mr-3 text-sm`}></i>
                    <span>{folder.name}</span>
                  </div>
                  {folder.count > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {folder.count}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-t mt-auto">
            <h3 className="font-semibold mb-2">Email Accounts</h3>
            <div className="space-y-2">
              {emailAccounts?.map((account) => (
                <div key={account.id} className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                    <i className="fas fa-envelope text-blue-600 text-xs"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{account.email}</p>
                    <p className="text-xs text-gray-500">{account.quota} MB</p>
                  </div>
                </div>
              )) || (
                <div className="text-sm text-gray-500">No email accounts configured</div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Email List */}
          <div className="w-1/3 border-r flex flex-col">
            <div className="p-4 border-b">
              <h2 className="font-semibold capitalize">{selectedFolder}</h2>
              <p className="text-sm text-gray-500">{filteredEmails.length} emails</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                    selectedEmail?.id === email.id ? "bg-blue-50 border-blue-200" : ""
                  } ${!email.isRead ? "bg-blue-25" : ""}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <span className={`font-medium ${!email.isRead ? "text-blue-600" : "text-gray-900"}`}>
                        {email.from}
                      </span>
                      {email.isStarred && (
                        <i className="fas fa-star text-yellow-500 ml-2"></i>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{formatDate(email.timestamp)}</span>
                  </div>
                  <h3 className={`font-medium mb-1 ${!email.isRead ? "text-blue-700" : "text-gray-800"}`}>
                    {email.subject}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{email.body}</p>
                  <div className="flex items-center mt-2">
                    {!email.isRead && (
                      <Badge variant="secondary" className="text-xs">New</Badge>
                    )}
                    {email.attachments && email.attachments.length > 0 && (
                      <i className="fas fa-paperclip text-gray-400 ml-2"></i>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Email Content */}
          <div className="flex-1 flex flex-col">
            {isComposing ? (
              <div className="flex-1 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Compose Email</h2>
                  <Button
                    variant="outline"
                    onClick={() => setIsComposing(false)}
                  >
                    <i className="fas fa-times mr-2"></i>
                    Cancel
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="to">To *</Label>
                      <Input
                        id="to"
                        value={composeData.to}
                        onChange={(e) => setComposeData({...composeData, to: e.target.value})}
                        placeholder="recipient@example.com"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cc">CC</Label>
                      <Input
                        id="cc"
                        value={composeData.cc}
                        onChange={(e) => setComposeData({...composeData, cc: e.target.value})}
                        placeholder="cc@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={composeData.subject}
                      onChange={(e) => setComposeData({...composeData, subject: e.target.value})}
                      placeholder="Email subject"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="body">Message</Label>
                    <textarea
                      id="body"
                      value={composeData.body}
                      onChange={(e) => setComposeData({...composeData, body: e.target.value})}
                      className="w-full h-64 p-3 border rounded-md resize-none"
                      placeholder="Type your message here..."
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleSendEmail}
                      disabled={sendEmailMutation.isPending}
                    >
                      <i className="fas fa-paper-plane mr-2"></i>
                      {sendEmailMutation.isPending ? "Sending..." : "Send"}
                    </Button>
                    <Button variant="outline">
                      <i className="fas fa-save mr-2"></i>
                      Save Draft
                    </Button>
                    <Button variant="outline">
                      <i className="fas fa-paperclip mr-2"></i>
                      Attach File
                    </Button>
                  </div>
                </div>
              </div>
            ) : selectedEmail ? (
              <div className="flex-1 p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">{selectedEmail.subject}</h2>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">From: {selectedEmail.from}</span>
                      <span className="mx-2">•</span>
                      <span>To: {selectedEmail.to}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(selectedEmail.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <i className="fas fa-reply mr-2"></i>
                      Reply
                    </Button>
                    <Button variant="outline" size="sm">
                      <i className="fas fa-share mr-2"></i>
                      Forward
                    </Button>
                    <Button variant="outline" size="sm">
                      <i className="fas fa-trash mr-2"></i>
                      Delete
                    </Button>
                  </div>
                </div>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{selectedEmail.body}</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <i className="fas fa-envelope text-6xl text-gray-300 mb-4"></i>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Email Selected</h3>
                  <p className="text-gray-500">Select an email from the list to view its content</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
