import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function formatDate(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatUptime(seconds: number) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

export function calculatePercentage(used: number, total: number) {
  if (total === 0) return 0;
  return Math.round((used / total) * 100);
}

export function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800";
    case "suspended":
      return "bg-yellow-100 text-yellow-800";
    case "inactive":
    case "deleted":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getFileIcon(type: string, fileName?: string) {
  const extension = fileName?.split(".").pop()?.toLowerCase();
  
  if (type === "directory") {
    return "fas fa-folder";
  }
  
  switch (extension) {
    case "php":
    case "js":
    case "ts":
    case "jsx":
    case "tsx":
    case "css":
    case "scss":
    case "html":
    case "htm":
    case "json":
    case "xml":
      return "fas fa-file-code";
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "svg":
    case "webp":
      return "fas fa-file-image";
    case "pdf":
    case "doc":
    case "docx":
    case "txt":
    case "md":
      return "fas fa-file-alt";
    case "zip":
    case "rar":
    case "tar":
    case "gz":
      return "fas fa-file-archive";
    case "mp3":
    case "wav":
    case "ogg":
    case "flac":
      return "fas fa-file-audio";
    case "mp4":
    case "avi":
    case "mov":
    case "wmv":
      return "fas fa-file-video";
    default:
      return "fas fa-file";
  }
}

export function truncateString(str: string, maxLength: number) {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + "...";
}

export function validateEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateDomain(domain: string) {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
}

export function generatePassword(length: number = 12) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}
