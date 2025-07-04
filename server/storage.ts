
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, desc, and, gte } from "drizzle-orm";
import type { 
  InsertUser, 
  InsertHostingPackage, 
  InsertDomain, 
  InsertEmailAccount, 
  InsertDatabase, 
  InsertFileEntry,
  InsertServerStats,
  InsertNotification,
  InsertFileVersion,
  InsertBackup,
  InsertApiKey,
  InsertDashboardWidget,
  InsertSecurityScan
} from "@shared/schema";
import {
  users,
  hostingPackages,
  domains,
  emailAccounts,
  databases,
  fileEntries,
  serverStats,
  notifications,
  fileVersions,
  backups,
  apiKeys,
  dashboardWidgets,
  securityScans
} from "@shared/schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(databaseUrl);
const db = drizzle(sql);

class Storage {
  // Users
  async createUser(userData: InsertUser) {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async getUser(id: number) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByUsername(username: string) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getAllUsers() {
    return await db.select().from(users);
  }

  async updateUser(id: number, userData: Partial<InsertUser>) {
    const [user] = await db.update(users).set(userData).where(eq(users.id, id)).returning();
    return user;
  }

  async deleteUser(id: number) {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount! > 0;
  }

  async getUsersCount() {
    const result = await db.select().from(users);
    return result.length;
  }

  async updateUser2FA(userId: number, secret: string, enabled: boolean) {
    const [user] = await db.update(users)
      .set({ twoFactorSecret: secret, twoFactorEnabled: enabled })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async disable2FA(userId: number) {
    const [user] = await db.update(users)
      .set({ twoFactorSecret: null, twoFactorEnabled: false })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Hosting Packages
  async createHostingPackage(packageData: InsertHostingPackage) {
    const [pkg] = await db.insert(hostingPackages).values(packageData).returning();
    return pkg;
  }

  async getHostingPackage(id: number) {
    const [pkg] = await db.select().from(hostingPackages).where(eq(hostingPackages.id, id));
    return pkg;
  }

  async getAllHostingPackages() {
    return await db.select().from(hostingPackages);
  }

  async updateHostingPackage(id: number, packageData: Partial<InsertHostingPackage>) {
    const [pkg] = await db.update(hostingPackages).set(packageData).where(eq(hostingPackages.id, id)).returning();
    return pkg;
  }

  async deleteHostingPackage(id: number) {
    const result = await db.delete(hostingPackages).where(eq(hostingPackages.id, id));
    return result.rowCount! > 0;
  }

  // Domains
  async createDomain(domainData: InsertDomain) {
    const [domain] = await db.insert(domains).values(domainData).returning();
    return domain;
  }

  async getDomain(id: number) {
    const [domain] = await db.select().from(domains).where(eq(domains.id, id));
    return domain;
  }

  async getAllDomains() {
    return await db.select().from(domains);
  }

  async getDomainsByUserId(userId: number) {
    return await db.select().from(domains).where(eq(domains.userId, userId));
  }

  async deleteDomain(id: number) {
    const result = await db.delete(domains).where(eq(domains.id, id));
    return result.rowCount! > 0;
  }

  // Email Accounts
  async createEmailAccount(emailData: InsertEmailAccount) {
    const [email] = await db.insert(emailAccounts).values(emailData).returning();
    return email;
  }

  async getEmailAccount(id: number) {
    const [email] = await db.select().from(emailAccounts).where(eq(emailAccounts.id, id));
    return email;
  }

  async getAllEmailAccounts() {
    return await db.select().from(emailAccounts);
  }

  async getEmailAccountsByUserId(userId: number) {
    return await db.select().from(emailAccounts).where(eq(emailAccounts.userId, userId));
  }

  async deleteEmailAccount(id: number) {
    const result = await db.delete(emailAccounts).where(eq(emailAccounts.id, id));
    return result.rowCount! > 0;
  }

  // Databases
  async createDatabase(dbData: InsertDatabase) {
    const [database] = await db.insert(databases).values(dbData).returning();
    return database;
  }

  async getDatabase(id: number) {
    const [database] = await db.select().from(databases).where(eq(databases.id, id));
    return database;
  }

  async getAllDatabases() {
    return await db.select().from(databases);
  }

  async getDatabasesByUserId(userId: number) {
    return await db.select().from(databases).where(eq(databases.userId, userId));
  }

  async deleteDatabase(id: number) {
    const result = await db.delete(databases).where(eq(databases.id, id));
    return result.rowCount! > 0;
  }

  // File Entries
  async createFileEntry(fileData: InsertFileEntry) {
    const [file] = await db.insert(fileEntries).values(fileData).returning();
    return file;
  }

  async getFileEntry(id: number) {
    const [file] = await db.select().from(fileEntries).where(eq(fileEntries.id, id));
    return file;
  }

  async getFileEntriesByUserIdAndPath(userId: number, path: string) {
    return await db.select().from(fileEntries).where(
      and(eq(fileEntries.userId, userId), eq(fileEntries.path, path))
    );
  }

  async deleteFileEntry(id: number) {
    const result = await db.delete(fileEntries).where(eq(fileEntries.id, id));
    return result.rowCount! > 0;
  }

  // Server Stats
  async createServerStats(statsData: InsertServerStats) {
    const [stats] = await db.insert(serverStats).values(statsData).returning();
    return stats;
  }

  async getLatestServerStats() {
    const [stats] = await db.select().from(serverStats).orderBy(desc(serverStats.timestamp)).limit(1);
    return stats;
  }

  async getServerStatsHistory(limit: number = 24) {
    return await db.select().from(serverStats).orderBy(desc(serverStats.timestamp)).limit(limit);
  }

  // Notifications
  async createNotification(notificationData: InsertNotification) {
    const [notification] = await db.insert(notifications).values(notificationData).returning();
    return notification;
  }

  async getUserNotifications(userId: number, limit: number = 50) {
    return await db.select().from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async markNotificationAsRead(id: number) {
    const [notification] = await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  // File Versions
  async createFileVersion(versionData: InsertFileVersion) {
    const [version] = await db.insert(fileVersions).values(versionData).returning();
    return version;
  }

  async getFileVersions(fileId: number) {
    return await db.select().from(fileVersions)
      .where(eq(fileVersions.fileId, fileId))
      .orderBy(desc(fileVersions.createdAt));
  }

  // Backups
  async createBackup(backupData: InsertBackup) {
    const [backup] = await db.insert(backups).values(backupData).returning();
    return backup;
  }

  async getUserBackups(userId: number) {
    return await db.select().from(backups)
      .where(eq(backups.userId, userId))
      .orderBy(desc(backups.createdAt));
  }

  // API Keys
  async createApiKey(keyData: InsertApiKey) {
    const [apiKey] = await db.insert(apiKeys).values(keyData).returning();
    return apiKey;
  }

  async getUserApiKeys(userId: number) {
    return await db.select().from(apiKeys)
      .where(eq(apiKeys.userId, userId))
      .orderBy(desc(apiKeys.createdAt));
  }

  // Dashboard Widgets
  async createDashboardWidget(widgetData: InsertDashboardWidget) {
    const [widget] = await db.insert(dashboardWidgets).values(widgetData).returning();
    return widget;
  }

  async getUserDashboardWidgets(userId: number) {
    return await db.select().from(dashboardWidgets)
      .where(eq(dashboardWidgets.userId, userId))
      .orderBy(dashboardWidgets.position);
  }

  // Security Scans
  async createSecurityScan(scanData: InsertSecurityScan) {
    const [scan] = await db.insert(securityScans).values(scanData).returning();
    return scan;
  }

  async getLatestSecurityScan() {
    const [scan] = await db.select().from(securityScans)
      .orderBy(desc(securityScans.createdAt))
      .limit(1);
    return scan;
  }
}

export const storage = new Storage();
