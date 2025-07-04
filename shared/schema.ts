import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"), // user, admin
  packageId: integer("package_id"),
  status: text("status").notNull().default("active"), // active, suspended, deleted
  diskUsage: integer("disk_usage").default(0), // in MB
  createdAt: timestamp("created_at").defaultNow(),
  twoFactorSecret: text("two_factor_secret"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false)
});

export const hostingPackages = pgTable("hosting_packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  diskSpace: integer("disk_space").notNull(), // in GB
  bandwidth: integer("bandwidth").notNull(), // in GB
  emailAccounts: integer("email_accounts").notNull(),
  databases: integer("databases").notNull(),
  domains: integer("domains").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const domains = pgTable("domains", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  domain: text("domain").notNull().unique(),
  type: text("type").notNull(), // primary, addon, subdomain, alias
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emailAccounts = pgTable("email_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  quota: integer("quota").notNull(), // in MB
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const databases = pgTable("databases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull().default("postgresql"),
  size: integer("size").default(0), // in MB
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const fileEntries = pgTable("file_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  path: text("path").notNull(),
  type: text("type").notNull(), // file, directory
  size: integer("size").default(0), // in bytes
  mimeType: text("mime_type"),
  modifiedAt: timestamp("modified_at").defaultNow(),
});

export const serverStats = pgTable("server_stats", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow(),
  cpuUsage: integer("cpu_usage").notNull(), // percentage
  memoryUsage: integer("memory_usage").notNull(), // percentage
  diskUsage: integer("disk_usage").notNull(), // percentage
  activeUsers: integer("active_users").notNull(),
  uptime: integer("uptime").notNull(), // in seconds
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"), // null for system-wide notifications
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"), // info, warning, error, success
  isRead: boolean("is_read").default(false),
  priority: text("priority").notNull().default("normal"), // low, normal, high, critical
  createdAt: timestamp("created_at").defaultNow(),
});

export const fileVersions = pgTable("file_versions", {
  id: serial("id").primaryKey(),
  fileId: integer("file_id").notNull(),
  userId: integer("user_id").notNull(),
  versionNumber: integer("version_number").notNull(),
  content: text("content").notNull(),
  size: integer("size").notNull(), // in bytes
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const backups = pgTable("backups", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // full, incremental, files, database
  status: text("status").notNull().default("pending"), // pending, running, completed, failed
  size: integer("size").default(0), // in MB
  location: text("location"), // backup file path
  scheduledAt: timestamp("scheduled_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  key: text("key").notNull().unique(),
  permissions: text("permissions").notNull(), // JSON array of permissions
  lastUsed: timestamp("last_used"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dashboardWidgets = pgTable("dashboard_widgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // server_stats, quick_actions, notifications, etc.
  position: integer("position").notNull(),
  size: text("size").notNull().default("medium"), // small, medium, large
  config: text("config"), // JSON configuration for widget
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const securityScans = pgTable("security_scans", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // malware, vulnerability, file_integrity
  status: text("status").notNull().default("pending"), // pending, running, completed, failed
  results: text("results"), // JSON results
  threatsFound: integer("threats_found").default(0),
  scheduledAt: timestamp("scheduled_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertHostingPackageSchema = createInsertSchema(hostingPackages).omit({
  id: true,
  createdAt: true,
});

export const insertDomainSchema = createInsertSchema(domains).omit({
  id: true,
  createdAt: true,
});

export const insertEmailAccountSchema = createInsertSchema(emailAccounts).omit({
  id: true,
  createdAt: true,
});

export const insertDatabaseSchema = createInsertSchema(databases).omit({
  id: true,
  createdAt: true,
});

export const insertFileEntrySchema = createInsertSchema(fileEntries).omit({
  id: true,
  modifiedAt: true,
});

export const insertServerStatsSchema = createInsertSchema(serverStats).omit({
  id: true,
  timestamp: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertFileVersionSchema = createInsertSchema(fileVersions).omit({
  id: true,
  createdAt: true,
});

export const insertBackupSchema = createInsertSchema(backups).omit({
  id: true,
  createdAt: true,
});

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  createdAt: true,
  lastUsed: true,
});

export const insertDashboardWidgetSchema = createInsertSchema(dashboardWidgets).omit({
  id: true,
  createdAt: true,
});

export const insertSecurityScanSchema = createInsertSchema(securityScans).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type HostingPackage = typeof hostingPackages.$inferSelect;
export type InsertHostingPackage = z.infer<typeof insertHostingPackageSchema>;

export type Domain = typeof domains.$inferSelect;
export type InsertDomain = z.infer<typeof insertDomainSchema>;

export type EmailAccount = typeof emailAccounts.$inferSelect;
export type InsertEmailAccount = z.infer<typeof insertEmailAccountSchema>;

export type Database = typeof databases.$inferSelect;
export type InsertDatabase = z.infer<typeof insertDatabaseSchema>;

export type FileEntry = typeof fileEntries.$inferSelect;
export type InsertFileEntry = z.infer<typeof insertFileEntrySchema>;

export type ServerStats = typeof serverStats.$inferSelect;
export type InsertServerStats = z.infer<typeof insertServerStatsSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type FileVersion = typeof fileVersions.$inferSelect;
export type InsertFileVersion = z.infer<typeof insertFileVersionSchema>;

export type Backup = typeof backups.$inferSelect;
export type InsertBackup = z.infer<typeof insertBackupSchema>;

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;

export type DashboardWidget = typeof dashboardWidgets.$inferSelect;
export type InsertDashboardWidget = z.infer<typeof insertDashboardWidgetSchema>;

export type SecurityScan = typeof securityScans.$inferSelect;
export type InsertSecurityScan = z.infer<typeof insertSecurityScanSchema>;