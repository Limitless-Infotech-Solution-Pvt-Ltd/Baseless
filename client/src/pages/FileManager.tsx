
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { FileEntry } from "@shared/schema";

interface FileManagerProps {
  userId?: number;
}

export default function FileManager({ userId = 1 }: FileManagerProps) {
  const [currentPath, setCurrentPath] = useState("/");
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [editingFile, setEditingFile] = useState<FileEntry | null>(null);
  const [fileContent, setFileContent] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: files, isLoading } = useQuery<FileEntry[]>({
    queryKey: ["/api/files/user", userId, currentPath],
    queryFn: async () => {
      const response = await fetch(`/api/files/user/${userId}?path=${encodeURIComponent(currentPath)}`);
      if (!response.ok) throw new Error("Failed to fetch files");
      return response.json();
    },
  });

  const createFileMutation = useMutation({
    mutationFn: async (fileData: any) => {
      const response = await fetch("/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fileData),
      });
      if (!response.ok) throw new Error("Failed to create file");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files/user", userId] });
      toast({ title: "Success", description: "File created successfully" });
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: number) => {
      const response = await fetch(`/api/files/${fileId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete file");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files/user", userId] });
      toast({ title: "Success", description: "File deleted successfully" });
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    setIsUploading(true);
    
    try {
      for (const file of uploadedFiles) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const content = e.target?.result as string;
          const fileData = {
            userId,
            name: file.name,
            path: currentPath,
            type: "file",
            size: file.size,
            mimeType: file.type,
            content: content,
          };
          
          await createFileMutation.mutateAsync(fileData);
        };
        
        if (file.type.startsWith('text/') || file.type === 'application/json') {
          reader.readAsText(file);
        } else {
          reader.readAsDataURL(file);
        }
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to upload files", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (file: FileEntry) => {
    try {
      // In a real implementation, this would fetch the file content from the server
      const blob = new Blob([`Mock content for ${file.name}`], { type: file.mimeType || 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({ title: "Error", description: "Failed to download file", variant: "destructive" });
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    const folderData = {
      userId,
      name: newFolderName,
      path: currentPath,
      type: "directory",
      size: 0,
    };
    
    try {
      await createFileMutation.mutateAsync(folderData);
      setNewFolderName("");
      setShowNewFolder(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to create folder", variant: "destructive" });
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedFiles.length === 0) return;
    
    try {
      for (const fileId of selectedFiles) {
        await deleteFileMutation.mutateAsync(fileId);
      }
      setSelectedFiles([]);
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete files", variant: "destructive" });
    }
  };

  const navigateToPath = (path: string) => {
    setCurrentPath(path);
    setSelectedFiles([]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: FileEntry) => {
    if (file.type === 'directory') return 'fas fa-folder';
    if (file.mimeType?.startsWith('image/')) return 'fas fa-image';
    if (file.mimeType?.startsWith('text/')) return 'fas fa-file-text';
    if (file.mimeType?.includes('pdf')) return 'fas fa-file-pdf';
    if (file.mimeType?.includes('zip')) return 'fas fa-file-archive';
    return 'fas fa-file';
  };

  const breadcrumbPaths = currentPath.split('/').filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">File Manager</h1>
        <div className="flex items-center space-x-2">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <Button
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={isUploading}
          >
            <i className="fas fa-upload mr-2"></i>
            {isUploading ? 'Uploading...' : 'Upload Files'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowNewFolder(true)}
          >
            <i className="fas fa-folder-plus mr-2"></i>
            New Folder
          </Button>
          {selectedFiles.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleDeleteSelected}
            >
              <i className="fas fa-trash mr-2"></i>
              Delete Selected ({selectedFiles.length})
            </Button>
          )}
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateToPath('/')}
              className="text-blue-600 hover:text-blue-800"
            >
              <i className="fas fa-home mr-1"></i>
              Home
            </Button>
            {breadcrumbPaths.map((path, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-gray-400">/</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateToPath('/' + breadcrumbPaths.slice(0, index + 1).join('/'))}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {path}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* New Folder Dialog */}
      {showNewFolder && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Folder</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
              />
              <Button onClick={handleCreateFolder}>Create</Button>
              <Button variant="outline" onClick={() => setShowNewFolder(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File List */}
      <Card>
        <CardHeader>
          <CardTitle>Files and Folders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading files...</div>
          ) : files && files.length > 0 ? (
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 ${
                    selectedFiles.includes(file.id) ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFiles([...selectedFiles, file.id]);
                        } else {
                          setSelectedFiles(selectedFiles.filter(id => id !== file.id));
                        }
                      }}
                      className="rounded"
                    />
                    <i className={`${getFileIcon(file)} text-lg text-gray-600`}></i>
                    <div>
                      <h3 className="font-medium">{file.name}</h3>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size || 0)} • {new Date(file.modifiedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{file.type}</Badge>
                    {file.type === 'directory' ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateToPath(file.path + '/' + file.name)}
                      >
                        <i className="fas fa-folder-open"></i>
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(file)}
                        >
                          <i className="fas fa-download"></i>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingFile(file)}
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No files found in this directory
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
