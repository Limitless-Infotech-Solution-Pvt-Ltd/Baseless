import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertFileEntrySchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatBytes, formatDateTime, getFileIcon } from "@/lib/utils";
import type { FileEntry } from "@shared/schema";
import { z } from "zod";

const createFileSchema = insertFileEntrySchema.extend({
  name: z.string().min(1, "File name is required"),
  type: z.enum(["file", "directory"]),
});

type CreateFileData = z.infer<typeof createFileSchema>;

export default function FileManager() {
  const [currentPath, setCurrentPath] = useState("/public_html");
  const [selectedUserId] = useState(1); // Default to first user for demo
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fileType, setFileType] = useState<"file" | "directory">("directory");
  const { toast } = useToast();

  const { data: files, isLoading: filesLoading } = useQuery<FileEntry[]>({
    queryKey: ["/api/files/user", selectedUserId, { path: currentPath }],
    queryFn: async () => {
      const response = await fetch(`/api/files/user/${selectedUserId}?path=${encodeURIComponent(currentPath)}`);
      if (!response.ok) {
        throw new Error("Failed to fetch files");
      }
      return response.json();
    },
  });

  const createFileMutation = useMutation({
    mutationFn: async (data: CreateFileData) => {
      return await apiRequest("POST", "/api/files", {
        ...data,
        userId: selectedUserId,
        path: currentPath,
        size: data.type === "directory" ? 0 : 1024, // Default 1KB for files
        mimeType: data.type === "directory" ? null : "text/plain",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files/user", selectedUserId] });
      toast({
        title: `${fileType === "directory" ? "Folder" : "File"} created successfully`,
        description: `The new ${fileType === "directory" ? "folder" : "file"} has been created.`,
      });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: `Error creating ${fileType === "directory" ? "folder" : "file"}`,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/files/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files/user", selectedUserId] });
      toast({
        title: "File deleted successfully",
        description: "The file has been deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting file",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<CreateFileData>({
    resolver: zodResolver(createFileSchema),
    defaultValues: {
      name: "",
      type: "directory",
      userId: selectedUserId,
      path: currentPath,
      size: 0,
      mimeType: null,
    },
  });

  const pathSegments = currentPath.split("/").filter(Boolean);

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
  };

  const handleDeleteFile = (fileId: number) => {
    if (window.confirm("Are you sure you want to delete this file? This action cannot be undone.")) {
      deleteFileMutation.mutate(fileId);
    }
  };

  const openCreateDialog = (type: "file" | "directory") => {
    setFileType(type);
    form.setValue("type", type);
    setDialogOpen(true);
  };

  // Mock file data for demonstration since we don't have actual file system
  const mockFiles: FileEntry[] = [
    {
      id: 1,
      userId: selectedUserId,
      name: "themes",
      path: currentPath,
      type: "directory",
      size: 0,
      mimeType: null,
      modifiedAt: new Date("2024-01-15"),
    },
    {
      id: 2,
      userId: selectedUserId,
      name: "plugins",
      path: currentPath,
      type: "directory",
      size: 0,
      mimeType: null,
      modifiedAt: new Date("2024-01-12"),
    },
    {
      id: 3,
      userId: selectedUserId,
      name: "index.php",
      path: currentPath,
      type: "file",
      size: 2048,
      mimeType: "text/php",
      modifiedAt: new Date("2024-01-10"),
    },
    {
      id: 4,
      userId: selectedUserId,
      name: "style.css",
      path: currentPath,
      type: "file",
      size: 15360,
      mimeType: "text/css",
      modifiedAt: new Date("2024-01-08"),
    },
    {
      id: 5,
      userId: selectedUserId,
      name: "config.json",
      path: currentPath,
      type: "file",
      size: 512,
      mimeType: "application/json",
      modifiedAt: new Date("2024-01-05"),
    },
  ];

  const displayFiles = files?.length ? files : mockFiles;

  if (filesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">File Manager</h3>
        <div className="flex items-center space-x-2">
          <Button onClick={() => openCreateDialog("file")}>
            <i className="fas fa-file-plus w-4 h-4 mr-2"></i>
            New File
          </Button>
          <Button onClick={() => openCreateDialog("directory")}>
            <i className="fas fa-folder-plus w-4 h-4 mr-2"></i>
            New Folder
          </Button>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New {fileType === "directory" ? "Folder" : "File"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createFileMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{fileType === "directory" ? "Folder" : "File"} Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={fileType === "directory" ? "Enter folder name" : "Enter file name"} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createFileMutation.isPending}>
                    {createFileMutation.isPending ? "Creating..." : `Create ${fileType === "directory" ? "Folder" : "File"}`}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <i className="fas fa-home cursor-pointer hover:text-blue-600" onClick={() => handleNavigate("/")}></i>
              <span>/</span>
              {pathSegments.map((segment, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span 
                    className="text-blue-600 cursor-pointer hover:underline"
                    onClick={() => handleNavigate("/" + pathSegments.slice(0, index + 1).join("/"))}
                  >
                    {segment}
                  </span>
                  {index < pathSegments.length - 1 && <span>/</span>}
                </div>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <i className="fas fa-th w-4 h-4"></i>
              </Button>
              <Button variant="ghost" size="sm">
                <i className="fas fa-list w-4 h-4"></i>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Modified</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {displayFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-50 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <i className={`${getFileIcon(file.type, file.name)} file-icon ${file.type === "directory" ? "file-icon-folder" : "file-icon-code"}`}></i>
                        <span className="text-sm font-medium text-slate-900">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {file.type === "directory" ? "-" : formatBytes(file.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {file.type === "directory" ? "Folder" : file.mimeType?.split("/")[1]?.toUpperCase() || "File"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {formatDateTime(file.modifiedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {file.type === "directory" ? (
                          <Button
                            variant="link"
                            size="sm"
                            className="text-blue-600 hover:text-blue-900 p-0"
                            onClick={() => handleNavigate(`${currentPath}/${file.name}`)}
                          >
                            Open
                          </Button>
                        ) : (
                          <Button
                            variant="link"
                            size="sm"
                            className="text-blue-600 hover:text-blue-900 p-0"
                            onClick={() => {/* TODO: Edit file dialog */}}
                          >
                            Edit
                          </Button>
                        )}
                        {file.type === "file" && (
                          <Button
                            variant="link"
                            size="sm"
                            className="text-green-600 hover:text-green-900 p-0"
                            onClick={() => {/* TODO: Download file */}}
                          >
                            Download
                          </Button>
                        )}
                        <Button
                          variant="link"
                          size="sm"
                          className="text-red-600 hover:text-red-900 p-0"
                          onClick={() => handleDeleteFile(file.id)}
                          disabled={deleteFileMutation.isPending}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {displayFiles.length === 0 && (
            <div className="text-center py-8">
              <i className="fas fa-folder-open text-4xl text-slate-400 mb-4"></i>
              <p className="text-slate-600">This folder is empty.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
