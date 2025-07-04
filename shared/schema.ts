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

export const dnsRecords = pgTable("dns_records", {
  id: serial("id").primaryKey(),
  domainId: integer("domain_id").notNull(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(), // subdomain or @
  type: text("type").notNull(), // A, AAAA, CNAME, MX, TXT, NS
  value: text("value").notNull(),
  priority: integer("priority"), // for MX records
  ttl: integer("ttl").default(3600),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sslCertificates = pgTable("ssl_certificates", {
  id: serial("id").primaryKey(),
  domainId: integer("domain_id").notNull(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull().default("lets_encrypt"), // lets_encrypt, custom, wildcard
  status: text("status").notNull().default("pending"), // pending, active, expired, failed
  issuer: text("issuer"),
  validFrom: timestamp("valid_from"),
  validTo: timestamp("valid_to"),
  autoRenew: boolean("auto_renew").default(true),
  certificate: text("certificate"), // PEM format
  privateKey: text("private_key"), // PEM format
  createdAt: timestamp("created_at").defaultNow(),
});

export const webmailSettings = pgTable("webmail_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  theme: text("theme").notNull().default("default"),
  signature: text("signature"),
  autoReply: boolean("auto_reply").default(false),
  autoReplyMessage: text("auto_reply_message"),
  forwardingEnabled: boolean("forwarding_enabled").default(false),
  forwardingAddress: text("forwarding_address"),
  spamFilterLevel: text("spam_filter_level").notNull().default("medium"), // low, medium, high
  language: text("language").notNull().default("en"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const codeProjects = pgTable("code_projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  language: text("language").notNull(), // html, css, js, php, python, etc.
  framework: text("framework"), // react, vue, laravel, django, etc.
  files: text("files"), // JSON array of file structure
  isPublic: boolean("is_public").default(false),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiLearningData = pgTable("ai_learning_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  category: text("category").notNull(), // behavior, preferences, interests, usage_patterns
  dataType: text("data_type").notNull(), // click, time_spent, feature_usage, preference
  data: text("data").notNull(), // JSON data
  context: text("context"), // Additional context information
  weight: integer("weight").default(1), // Importance weight for learning
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiRecommendations = pgTable("ai_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // feature, optimization, tutorial, upgrade
  title: text("title").notNull(),
  description: text("description").notNull(),
  actionUrl: text("action_url"),
  priority: integer("priority").default(1), // 1-10 priority
  confidence: integer("confidence").default(50), // 0-100 confidence score
  isShown: boolean("is_shown").default(false),
  isAccepted: boolean("is_accepted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const knowledgeBase = pgTable("knowledge_base", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  title: text("title").notNull(),
  content: text("content").notNull(),
  tags: text("tags"), // JSON array of tags
  difficulty: text("difficulty").notNull().default("beginner"), // beginner, intermediate, advanced
  estimatedTime: integer("estimated_time"), // in minutes
  isPublic: boolean("is_public").default(true),
  views: integer("views").default(0),
  rating: integer("rating").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

export const insertDnsRecordSchema = createInsertSchema(dnsRecords).omit({
  id: true,
  createdAt: true,
});

export const insertSslCertificateSchema = createInsertSchema(sslCertificates).omit({
  id: true,
  createdAt: true,
});

export const insertWebmailSettingsSchema = createInsertSchema(webmailSettings).omit({
  id: true,
  createdAt: true,
});

export const insertCodeProjectSchema = createInsertSchema(codeProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiLearningDataSchema = createInsertSchema(aiLearningData).omit({
  id: true,
  createdAt: true,
});

export const insertAiRecommendationSchema = createInsertSchema(aiRecommendations).omit({
  id: true,
  createdAt: true,
});

export const insertKnowledgeBaseSchema = createInsertSchema(knowledgeBase).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
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

export type DnsRecord = typeof dnsRecords.$inferSelect;
export type InsertDnsRecord = z.infer<typeof insertDnsRecordSchema>;

export type SslCertificate = typeof sslCertificates.$inferSelect;
export type InsertSslCertificate = z.infer<typeof insertSslCertificateSchema>;

export type WebmailSettings = typeof webmailSettings.$inferSelect;
export type InsertWebmailSettings = z.infer<typeof insertWebmailSettingsSchema>;

export type CodeProject = typeof codeProjects.$inferSelect;
export type InsertCodeProject = z.infer<typeof insertCodeProjectSchema>;

export type AiLearningData = typeof aiLearningData.$inferSelect;
export type InsertAiLearningData = z.infer<typeof insertAiLearningDataSchema>;

export type AiRecommendation = typeof aiRecommendations.$inferSelect;
export type InsertAiRecommendation = z.infer<typeof insertAiRecommendationSchema>;

export type KnowledgeBase = typeof knowledgeBase.$inferSelect;
export type InsertKnowledgeBase = z.infer<typeof insertKnowledgeBaseSchema>;