
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface Email {
  id: number;
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  folder: string;
}

interface EmailFolder {
  name: string;
  count: number;
  icon: string;
}

export default function Webmail() {
  const [selectedFolder, setSelectedFolder] = useState("inbox");
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const { toast } = useToast();

  const folders: EmailFolder[] = [
    { name: "inbox", count: 12, icon: "fas fa-inbox" },
    { name: "sent", count: 5, icon: "fas fa-paper-plane" },
    { name: "drafts", count: 2, icon: "fas fa-file-alt" },
    { name: "spam", count: 3, icon: "fas fa-exclamation-triangle" },
    { name: "trash", count: 1, icon: "fas fa-trash" },
  ];

  const mockEmails: Email[] = [
    {
      id: 1,
      from: "admin@baseless.dev",
      to: "user@example.com",
      subject: "Welcome to Baseless Hosting",
      body: "Thank you for choosing Baseless Hosting. Your account has been successfully created.",
      timestamp: "2024-01-15T10:30:00Z",
      isRead: false,
      isStarred: true,
      hasAttachments: false,
      folder: "inbox"
    },
    {
      id: 2,
      from: "support@baseless.dev",
      to: "user@example.com",
      subject: "Server Maintenance Notice",
      body: "We will be performing scheduled maintenance on our servers this weekend.",
      timestamp: "2024-01-14T14:20:00Z",
      isRead: true,
      isStarred: false,
      hasAttachments: true,
      folder: "inbox"
    },
  ];

  const [emails, setEmails] = useState<Email[]>(mockEmails);
  const [composeForm, setComposeForm] = useState({
    to: "",
    cc: "",
    bcc: "",
    subject: "",
    body: "",
  });

  const filteredEmails = emails.filter(email => 
    email.folder === selectedFolder &&
    (email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
     email.from.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSendEmail = () => {
    // Mock sending email
    const newEmail: Email = {
      id: Date.now(),
      from: "user@example.com",
      to: composeForm.to,
      subject: composeForm.subject,
      body: composeForm.body,
      timestamp: new Date().toISOString(),
      isRead: true,
      isStarred: false,
      hasAttachments: false,
      folder: "sent"
    };

    setEmails([...emails, newEmail]);
    setComposeForm({ to: "", cc: "", bcc: "", subject: "", body: "" });
    setIsComposing(false);
    toast({ title: "Email sent successfully" });
  };

  const markAsRead = (email: Email) => {
    setEmails(emails.map(e => e.id === email.id ? { ...e, isRead: true } : e));
  };

  const toggleStar = (email: Email) => {
    setEmails(emails.map(e => e.id === email.id ? { ...e, isStarred: !e.isStarred } : e));
  };

  const deleteEmail = (email: Email) => {
    setEmails(emails.map(e => e.id === email.id ? { ...e, folder: "trash" } : e));
    setSelectedEmail(null);
    toast({ title: "Email moved to trash" });
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Baseless Webmail</h1>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
            <Button onClick={() => setIsComposing(true)}>
              <i className="fas fa-edit mr-2"></i>
              Compose
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r bg-gray-50 p-4">
          <nav className="space-y-2">
            {folders.map((folder) => (
              <div
                key={folder.name}
                className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                  selectedFolder === folder.name ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
                }`}
                onClick={() => setSelectedFolder(folder.name)}
              >
                <div className="flex items-center space-x-2">
                  <i className={folder.icon}></i>
                  <span className="capitalize">{folder.name}</span>
                </div>
                {folder.count > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {folder.count}
                  </Badge>
                )}
              </div>
            ))}
          </nav>

          <Separator className="my-4" />

          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-gray-600">Labels</h3>
            <div className="space-y-1">
              <div className="flex items-center space-x-2 p-1 text-sm text-gray-600">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Important</span>
              </div>
              <div className="flex items-center space-x-2 p-1 text-sm text-gray-600">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Work</span>
              </div>
              <div className="flex items-center space-x-2 p-1 text-sm text-gray-600">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Personal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Email List */}
        <div className="w-96 border-r">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold capitalize">{selectedFolder}</h2>
              <Button variant="ghost" size="sm">
                <i className="fas fa-sync-alt"></i>
              </Button>
            </div>
          </div>
          <div className="overflow-y-auto">
            {filteredEmails.map((email) => (
              <div
                key={email.id}
                className={`p-4 border-b cursor-pointer transition-colors ${
                  selectedEmail?.id === email.id ? "bg-blue-50" : "hover:bg-gray-50"
                } ${!email.isRead ? "bg-blue-25 border-l-4 border-l-blue-500" : ""}`}
                onClick={() => {
                  setSelectedEmail(email);
                  markAsRead(email);
                }}
              >
                <div className="flex items-start space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      {email.from.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className={`text-sm truncate ${!email.isRead ? "font-semibold" : ""}`}>
                        {email.from}
                      </p>
                      <div className="flex items-center space-x-1">
                        {email.isStarred && (
                          <i className="fas fa-star text-yellow-500 text-xs"></i>
                        )}
                        {email.hasAttachments && (
                          <i className="fas fa-paperclip text-gray-400 text-xs"></i>
                        )}
                      </div>
                    </div>
                    <p className={`text-sm truncate ${!email.isRead ? "font-semibold" : ""}`}>
                      {email.subject}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {email.body}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(email.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Email Content */}
        <div className="flex-1 flex flex-col">
          {selectedEmail ? (
            <>
              <div className="p-4 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedEmail.subject}</h2>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <span>From: {selectedEmail.from}</span>
                      <span>To: {selectedEmail.to}</span>
                      <span>{new Date(selectedEmail.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStar(selectedEmail)}
                    >
                      <i className={`fas fa-star ${selectedEmail.isStarred ? "text-yellow-500" : "text-gray-400"}`}></i>
                    </Button>
                    <Button variant="ghost" size="sm">
                      <i className="fas fa-reply"></i>
                    </Button>
                    <Button variant="ghost" size="sm">
                      <i className="fas fa-forward"></i>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteEmail(selectedEmail)}
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="prose max-w-none">
                  {selectedEmail.body.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <i className="fas fa-envelope text-6xl mb-4"></i>
                <p>Select an email to view its content</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose Dialog */}
      <Dialog open={isComposing} onOpenChange={setIsComposing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Compose Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="to">To</Label>
              <Input
                id="to"
                value={composeForm.to}
                onChange={(e) => setComposeForm({ ...composeForm, to: e.target.value })}
                placeholder="recipient@example.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cc">CC</Label>
                <Input
                  id="cc"
                  value={composeForm.cc}
                  onChange={(e) => setComposeForm({ ...composeForm, cc: e.target.value })}
                  placeholder="cc@example.com"
                />
              </div>
              <div>
                <Label htmlFor="bcc">BCC</Label>
                <Input
                  id="bcc"
                  value={composeForm.bcc}
                  onChange={(e) => setComposeForm({ ...composeForm, bcc: e.target.value })}
                  placeholder="bcc@example.com"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={composeForm.subject}
                onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                placeholder="Email subject"
              />
            </div>
            <div>
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                value={composeForm.body}
                onChange={(e) => setComposeForm({ ...composeForm, body: e.target.value })}
                placeholder="Write your message here..."
                rows={10}
              />
            </div>
            <div className="flex justify-between">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <i className="fas fa-paperclip mr-2"></i>
                  Attach
                </Button>
                <Button variant="outline" size="sm">
                  <i className="fas fa-image mr-2"></i>
                  Insert Image
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={() => setIsComposing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendEmail}>
                  <i className="fas fa-paper-plane mr-2"></i>
                  Send
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
