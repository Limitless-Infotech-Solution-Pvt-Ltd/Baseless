import { 
  users, 
  hostingPackages, 
  domains, 
  emailAccounts, 
  databases, 
  fileEntries, 
  serverStats,
  type User, 
  type InsertUser,
  type HostingPackage,
  type InsertHostingPackage,
  type Domain,
  type InsertDomain,
  type EmailAccount,
  type InsertEmailAccount,
  type Database,
  type InsertDatabase,
  type FileEntry,
  type InsertFileEntry,
  type ServerStats,
  type InsertServerStats
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  getUsersCount(): Promise<number>;

  // Hosting Packages
  getHostingPackage(id: number): Promise<HostingPackage | undefined>;
  createHostingPackage(pkg: InsertHostingPackage): Promise<HostingPackage>;
  updateHostingPackage(id: number, pkg: Partial<InsertHostingPackage>): Promise<HostingPackage | undefined>;
  deleteHostingPackage(id: number): Promise<boolean>;
  getAllHostingPackages(): Promise<HostingPackage[]>;

  // Domains
  getDomain(id: number): Promise<Domain | undefined>;
  getDomainsByUserId(userId: number): Promise<Domain[]>;
  createDomain(domain: InsertDomain): Promise<Domain>;
  updateDomain(id: number, domain: Partial<InsertDomain>): Promise<Domain | undefined>;
  deleteDomain(id: number): Promise<boolean>;
  getAllDomains(): Promise<Domain[]>;

  // Email Accounts
  getEmailAccount(id: number): Promise<EmailAccount | undefined>;
  getEmailAccountsByUserId(userId: number): Promise<EmailAccount[]>;
  createEmailAccount(email: InsertEmailAccount): Promise<EmailAccount>;
  updateEmailAccount(id: number, email: Partial<InsertEmailAccount>): Promise<EmailAccount | undefined>;
  deleteEmailAccount(id: number): Promise<boolean>;
  getAllEmailAccounts(): Promise<EmailAccount[]>;

  // Databases
  getDatabase(id: number): Promise<Database | undefined>;
  getDatabasesByUserId(userId: number): Promise<Database[]>;
  createDatabase(db: InsertDatabase): Promise<Database>;
  updateDatabase(id: number, db: Partial<InsertDatabase>): Promise<Database | undefined>;
  deleteDatabase(id: number): Promise<boolean>;
  getAllDatabases(): Promise<Database[]>;

  // File Entries
  getFileEntry(id: number): Promise<FileEntry | undefined>;
  getFileEntriesByUserId(userId: number): Promise<FileEntry[]>;
  getFileEntriesByUserIdAndPath(userId: number, path: string): Promise<FileEntry[]>;
  createFileEntry(file: InsertFileEntry): Promise<FileEntry>;
  updateFileEntry(id: number, file: Partial<InsertFileEntry>): Promise<FileEntry | undefined>;
  deleteFileEntry(id: number): Promise<boolean>;

  // Server Stats
  getLatestServerStats(): Promise<ServerStats | undefined>;
  createServerStats(stats: InsertServerStats): Promise<ServerStats>;
  getServerStatsHistory(limit: number): Promise<ServerStats[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private hostingPackages: Map<number, HostingPackage> = new Map();
  private domains: Map<number, Domain> = new Map();
  private emailAccounts: Map<number, EmailAccount> = new Map();
  private databases: Map<number, Database> = new Map();
  private fileEntries: Map<number, FileEntry> = new Map();
  private serverStats: Map<number, ServerStats> = new Map();

  private userIdCounter = 1;
  private packageIdCounter = 1;
  private domainIdCounter = 1;
  private emailIdCounter = 1;
  private databaseIdCounter = 1;
  private fileIdCounter = 1;
  private statsIdCounter = 1;

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Sample hosting packages
    this.hostingPackages.set(1, {
      id: 1,
      name: "Basic",
      diskSpace: 1,
      bandwidth: 10,
      emailAccounts: 5,
      databases: 1,
      domains: 1,
      status: "active",
      createdAt: new Date()
    });

    this.hostingPackages.set(2, {
      id: 2,
      name: "Professional",
      diskSpace: 5,
      bandwidth: 50,
      emailAccounts: 25,
      databases: 5,
      domains: 5,
      status: "active",
      createdAt: new Date()
    });

    this.hostingPackages.set(3, {
      id: 3,
      name: "Enterprise",
      diskSpace: 20,
      bandwidth: 200,
      emailAccounts: 100,
      databases: 20,
      domains: 20,
      status: "active",
      createdAt: new Date()
    });

    // Sample users
    this.users.set(1, {
      id: 1,
      username: "admin",
      email: "admin@baseless.local",
      password: "hashed_password",
      packageId: 3,
      status: "active",
      diskUsage: 1024,
      createdAt: new Date(Date.now() - 86400000)
    });

    this.users.set(2, {
      id: 2,
      username: "johndoe",
      email: "john@example.com",
      password: "hashed_password",
      packageId: 2,
      status: "active",
      diskUsage: 512,
      createdAt: new Date(Date.now() - 172800000)
    });

    this.users.set(3, {
      id: 3,
      username: "janesmith",
      email: "jane@example.com",
      password: "hashed_password",
      packageId: 1,
      status: "active",
      diskUsage: 256,
      createdAt: new Date(Date.now() - 259200000)
    });

    // Generate initial server stats
    this.generateServerStats();

    this.userIdCounter = 4;
    this.packageIdCounter = 4;
  }

  private generateServerStats() {
    const stats: ServerStats = {
      id: this.statsIdCounter++,
      timestamp: new Date(),
      cpuUsage: Math.floor(Math.random() * 30) + 10, // 10-40%
      memoryUsage: Math.floor(Math.random() * 40) + 20, // 20-60%
      diskUsage: Math.floor(Math.random() * 20) + 30, // 30-50%
      activeUsers: this.users.size,
      uptime: 99 * 24 * 3600 // 99 days uptime
    };
    this.serverStats.set(stats.id, stats);

    // Continue generating stats every 30 seconds
    setTimeout(() => this.generateServerStats(), 30000);
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.userIdCounter++,
      username: insertUser.username,
      email: insertUser.email,
      password: insertUser.password,
      packageId: insertUser.packageId ?? null,
      status: insertUser.status || "active",
      diskUsage: insertUser.diskUsage ?? 0,
      createdAt: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updateData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUsersCount(): Promise<number> {
    return this.users.size;
  }

  // Hosting Packages
  async getHostingPackage(id: number): Promise<HostingPackage | undefined> {
    return this.hostingPackages.get(id);
  }

  async createHostingPackage(insertPackage: InsertHostingPackage): Promise<HostingPackage> {
    const pkg: HostingPackage = {
      id: this.packageIdCounter++,
      name: insertPackage.name,
      diskSpace: insertPackage.diskSpace,
      bandwidth: insertPackage.bandwidth,
      emailAccounts: insertPackage.emailAccounts,
      databases: insertPackage.databases,
      domains: insertPackage.domains,
      status: insertPackage.status || "active",
      createdAt: new Date()
    };
    this.hostingPackages.set(pkg.id, pkg);
    return pkg;
  }

  async updateHostingPackage(id: number, updateData: Partial<InsertHostingPackage>): Promise<HostingPackage | undefined> {
    const pkg = this.hostingPackages.get(id);
    if (!pkg) return undefined;

    const updatedPackage = { ...pkg, ...updateData };
    this.hostingPackages.set(id, updatedPackage);
    return updatedPackage;
  }

  async deleteHostingPackage(id: number): Promise<boolean> {
    return this.hostingPackages.delete(id);
  }

  async getAllHostingPackages(): Promise<HostingPackage[]> {
    return Array.from(this.hostingPackages.values());
  }

  // Domains
  async getDomain(id: number): Promise<Domain | undefined> {
    return this.domains.get(id);
  }

  async getDomainsByUserId(userId: number): Promise<Domain[]> {
    return Array.from(this.domains.values()).filter(domain => domain.userId === userId);
  }

  async createDomain(insertDomain: InsertDomain): Promise<Domain> {
    const domain: Domain = {
      id: this.domainIdCounter++,
      userId: insertDomain.userId,
      domain: insertDomain.domain,
      type: insertDomain.type,
      status: insertDomain.status || "active",
      createdAt: new Date()
    };
    this.domains.set(domain.id, domain);
    return domain;
  }

  async updateDomain(id: number, updateData: Partial<InsertDomain>): Promise<Domain | undefined> {
    const domain = this.domains.get(id);
    if (!domain) return undefined;

    const updatedDomain = { ...domain, ...updateData };
    this.domains.set(id, updatedDomain);
    return updatedDomain;
  }

  async deleteDomain(id: number): Promise<boolean> {
    return this.domains.delete(id);
  }

  async getAllDomains(): Promise<Domain[]> {
    return Array.from(this.domains.values());
  }

  // Email Accounts
  async getEmailAccount(id: number): Promise<EmailAccount | undefined> {
    return this.emailAccounts.get(id);
  }

  async getEmailAccountsByUserId(userId: number): Promise<EmailAccount[]> {
    return Array.from(this.emailAccounts.values()).filter(email => email.userId === userId);
  }

  async createEmailAccount(insertEmail: InsertEmailAccount): Promise<EmailAccount> {
    const email: EmailAccount = {
      id: this.emailIdCounter++,
      userId: insertEmail.userId,
      email: insertEmail.email,
      password: insertEmail.password,
      quota: insertEmail.quota,
      status: insertEmail.status || "active",
      createdAt: new Date()
    };
    this.emailAccounts.set(email.id, email);
    return email;
  }

  async updateEmailAccount(id: number, updateData: Partial<InsertEmailAccount>): Promise<EmailAccount | undefined> {
    const email = this.emailAccounts.get(id);
    if (!email) return undefined;

    const updatedEmail = { ...email, ...updateData };
    this.emailAccounts.set(id, updatedEmail);
    return updatedEmail;
  }

  async deleteEmailAccount(id: number): Promise<boolean> {
    return this.emailAccounts.delete(id);
  }

  async getAllEmailAccounts(): Promise<EmailAccount[]> {
    return Array.from(this.emailAccounts.values());
  }

  // Databases
  async getDatabase(id: number): Promise<Database | undefined> {
    return this.databases.get(id);
  }

  async getDatabasesByUserId(userId: number): Promise<Database[]> {
    return Array.from(this.databases.values()).filter(db => db.userId === userId);
  }

  async createDatabase(insertDatabase: InsertDatabase): Promise<Database> {
    const db: Database = {
      id: this.databaseIdCounter++,
      userId: insertDatabase.userId,
      name: insertDatabase.name,
      type: insertDatabase.type || "postgresql",
      size: insertDatabase.size ?? 0,
      status: insertDatabase.status || "active",
      createdAt: new Date()
    };
    this.databases.set(db.id, db);
    return db;
  }

  async updateDatabase(id: number, updateData: Partial<InsertDatabase>): Promise<Database | undefined> {
    const db = this.databases.get(id);
    if (!db) return undefined;

    const updatedDatabase = { ...db, ...updateData };
    this.databases.set(id, updatedDatabase);
    return updatedDatabase;
  }

  async deleteDatabase(id: number): Promise<boolean> {
    return this.databases.delete(id);
  }

  async getAllDatabases(): Promise<Database[]> {
    return Array.from(this.databases.values());
  }

  // File Entries
  async getFileEntry(id: number): Promise<FileEntry | undefined> {
    return this.fileEntries.get(id);
  }

  async getFileEntriesByUserId(userId: number): Promise<FileEntry[]> {
    return Array.from(this.fileEntries.values()).filter(file => file.userId === userId);
  }

  async getFileEntriesByUserIdAndPath(userId: number, path: string): Promise<FileEntry[]> {
    return Array.from(this.fileEntries.values()).filter(file => 
      file.userId === userId && file.path === path
    );
  }

  async createFileEntry(insertFile: InsertFileEntry): Promise<FileEntry> {
    const file: FileEntry = {
      id: this.fileIdCounter++,
      userId: insertFile.userId,
      name: insertFile.name,
      path: insertFile.path,
      type: insertFile.type,
      size: insertFile.size ?? 0,
      mimeType: insertFile.mimeType ?? null,
      modifiedAt: new Date()
    };
    this.fileEntries.set(file.id, file);
    return file;
  }

  async updateFileEntry(id: number, updateData: Partial<InsertFileEntry>): Promise<FileEntry | undefined> {
    const file = this.fileEntries.get(id);
    if (!file) return undefined;

    const updatedFile = { ...file, ...updateData, modifiedAt: new Date() };
    this.fileEntries.set(id, updatedFile);
    return updatedFile;
  }

  async deleteFileEntry(id: number): Promise<boolean> {
    return this.fileEntries.delete(id);
  }

  // Server Stats
  async getLatestServerStats(): Promise<ServerStats | undefined> {
    const stats = Array.from(this.serverStats.values());
    return stats.length > 0 ? stats[stats.length - 1] : undefined;
  }

  async createServerStats(insertStats: InsertServerStats): Promise<ServerStats> {
    const stats: ServerStats = {
      id: this.statsIdCounter++,
      ...insertStats,
      timestamp: new Date()
    };
    this.serverStats.set(stats.id, stats);
    return stats;
  }

  async getServerStatsHistory(limit: number): Promise<ServerStats[]> {
    const stats = Array.from(this.serverStats.values());
    return stats.slice(-limit);
  }
}

// Use database storage if available, otherwise fallback to memory storage
export const storage = db ? new DatabaseStorage() : new MemStorage();

console.log(`Using ${db ? 'database' : 'in-memory'} storage for development`);

import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { users } from '@shared/schema';
import { type User, type InsertUser, type HostingPackage, type InsertHostingPackage, type Domain, type InsertDomain, type EmailAccount, type InsertEmailAccount, type Database, type InsertDatabase, type FileEntry, type InsertFileEntry, type ServerStats, type InsertServerStats } from '@shared/schema';

export class DatabaseStorage {
  private db: ReturnType<typeof drizzle> | null = null;

  constructor() {
    if (db) {
      this.db = db;
    }
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    if (!this.db) return undefined;
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!this.db) return undefined;
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!this.db) return undefined;
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(userData: any) {
    if (!this.db) throw new Error("Database not initialized");
    const [user] = await this.db.insert(users).values({
      ...userData,
      role: userData.role || 'user'
    }).returning();
    return user;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    if (!this.db) return undefined;
    const result = await this.db.update(users).set(user).where(eq(users.id, id)).returning();
    return result[0];
  }

  async deleteUser(id: number): Promise<boolean> {
    if (!this.db) return false;
    const result = await this.db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }

  async getAllUsers(): Promise<User[]> {
    if (!this.db) return [];
    return this.db.select().from(users);
  }

  async getUsersCount(): Promise<number> {
    if (!this.db) return 0;
    const result = await this.db.select({ count: sql<number>`count(*)` }).from(users);
    return result[0]?.count || 0;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    if (!this.db) return null;
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0] || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    if (!this.db) return null;
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0] || null;
  }

  // Hosting Packages
  async getHostingPackage(id: number): Promise<HostingPackage | undefined> {
    if (!this.db) return undefined;
    const result = await this.db.select().from(hostingPackages).where(eq(hostingPackages.id, id)).limit(1);
    return result[0];
  }

  async createHostingPackage(pkg: InsertHostingPackage): Promise<HostingPackage> {
    if (!this.db) throw new Error("Database not initialized");
    const result = await this.db.insert(hostingPackages).values(pkg).returning();
    return result[0];
  }

  async updateHostingPackage(id: number, pkg: Partial<InsertHostingPackage>): Promise<HostingPackage | undefined> {
    if (!this.db) return undefined;
    const result = await this.db.update(hostingPackages).set(pkg).where(eq(hostingPackages.id, id)).returning();
    return result[0];
  }

  async deleteHostingPackage(id: number): Promise<boolean> {
    if (!this.db) return false;
    const result = await this.db.delete(hostingPackages).where(eq(hostingPackages.id, id));
    return result.rowCount > 0;
  }

  async getAllHostingPackages(): Promise<HostingPackage[]> {
    if (!this.db) return [];
    return this.db.select().from(hostingPackages);
  }

  // Domains
  async getDomain(id: number): Promise<Domain | undefined> {
    if (!this.db) return undefined;
    const result = await this.db.select().from(domains).where(eq(domains.id, id)).limit(1);
    return result[0];
  }

  async getDomainsByUserId(userId: number): Promise<Domain[]> {
    if (!this.db) return [];
    return this.db.select().from(domains).where(eq(domains.userId, userId));
  }

  async createDomain(domain: InsertDomain): Promise<Domain> {
    if (!this.db) throw new Error("Database not initialized");
    const result = await this.db.insert(domains).values(domain).returning();
    return result[0];
  }

  async updateDomain(id: number, domain: Partial<InsertDomain>): Promise<Domain | undefined> {
    if (!this.db) return undefined;
    const result = await this.db.update(domains).set(domain).where(eq(domains.id, id)).returning();
    return result[0];
  }

  async deleteDomain(id: number): Promise<boolean> {
    if (!this.db) return false;
    const result = await this.db.delete(domains).where(eq(domains.id, id));
    return result.rowCount > 0;
  }

  async getAllDomains(): Promise<Domain[]> {
    if (!this.db) return [];
    return this.db.select().from(domains);
  }

  // Email Accounts
  async getEmailAccount(id: number): Promise<EmailAccount | undefined> {
    if (!this.db) return undefined;
    const result = await this.db.select().from(emailAccounts).where(eq(emailAccounts.id, id)).limit(1);
    return result[0];
  }

  async getEmailAccountsByUserId(userId: number): Promise<EmailAccount[]> {
    if (!this.db) return [];
    return this.db.select().from(emailAccounts).where(eq(emailAccounts.userId, userId));
  }

  async createEmailAccount(email: InsertEmailAccount): Promise<EmailAccount> {
    if (!this.db) throw new Error("Database not initialized");
    const result = await this.db.insert(emailAccounts).values(email).returning();
    return result[0];
  }

  async updateEmailAccount(id: number, email: Partial<InsertEmailAccount>): Promise<EmailAccount | undefined> {
    if (!this.db) return undefined;
    const result = await this.db.update(emailAccounts).set(email).where(eq(emailAccounts.id, id)).returning();
    return result[0];
  }

  async deleteEmailAccount(id: number): Promise<boolean> {
    if (!this.db) return false;
    const result = await this.db.delete(emailAccounts).where(eq(emailAccounts.id, id));
    return result.rowCount > 0;
  }

  async getAllEmailAccounts(): Promise<EmailAccount[]> {
    if (!this.db) return [];
    return this.db.select().from(emailAccounts);
  }

  // Databases
  async getDatabase(id: number): Promise<Database | undefined> {
    if (!this.db) return undefined;
    const result = await this.db.select().from(databases).where(eq(databases.id, id)).limit(1);
    return result[0];
  }

  async getDatabasesByUserId(userId: number): Promise<Database[]> {
    if (!this.db) return [];
    return this.db.select().from(databases).where(eq(databases.userId, userId));
  }

  async createDatabase(db: InsertDatabase): Promise<Database> {
    if (!this.db) throw new Error("Database not initialized");
    const result = await this.db.insert(databases).values(db).returning();
    return result[0];
  }

  async updateDatabase(id: number, db: Partial<InsertDatabase>): Promise<Database | undefined> {
    if (!this.db) return undefined;
    const result = await this.db.update(databases).set(db).where(eq(databases.id, id)).returning();
    return result[0];
  }

  async deleteDatabase(id: number): Promise<boolean> {
    if (!this.db) return false;
    const result = await this.db.delete(databases).where(eq(databases.id, id));
    return result.rowCount > 0;
  }

  async getAllDatabases(): Promise<Database[]> {
    if (!this.db) return [];
    return this.db.select().from(databases);
  }

  // File Entries
  async getFileEntry(id: number): Promise<FileEntry | undefined> {
    if (!this.db) return undefined;
    const result = await this.db.select().from(fileEntries).where(eq(fileEntries.id, id)).limit(1);
    return result[0];
  }

  async getFileEntriesByUserId(userId: number): Promise<FileEntry[]> {
    if (!this.db) return [];
    return this.db.select().from(fileEntries).where(eq(fileEntries.userId, userId));
  }

  async getFileEntriesByUserIdAndPath(userId: number, path: string): Promise<FileEntry[]> {
    if (!this.db) return [];
    return this.db.select().from(fileEntries).where(eq(fileEntries.userId, userId)).where(eq(fileEntries.path, path));
  }

  async createFileEntry(file: InsertFileEntry): Promise<FileEntry> {
    if (!this.db) throw new Error("Database not initialized");
    const result = await this.db.insert(fileEntries).values(file).returning();
    return result[0];
  }

  async updateFileEntry(id: number, file: Partial<InsertFileEntry>): Promise<FileEntry | undefined> {
    if (!this.db) return undefined;
    const result = await this.db.update(fileEntries).set(file).where(eq(fileEntries.id, id)).returning();
    return result[0];
  }

  async deleteFileEntry(id: number): Promise<boolean> {
    if (!this.db) return false;
    const result = await this.db.delete(fileEntries).where(eq(fileEntries.id, id));
    return result.rowCount > 0;
  }

  // Server Stats
  async getLatestServerStats(): Promise<ServerStats | undefined> {
    if (!this.db) return undefined;
    const result = await this.db.select().from(serverStats).orderBy(desc(serverStats.timestamp)).limit(1);
    return result[0];
  }

  async createServerStats(stats: InsertServerStats): Promise<ServerStats> {
    if (!this.db) throw new Error("Database not initialized");
    const result = await this.db.insert(serverStats).values(stats).returning();
    return result[0];
  }

  async getServerStatsHistory(limit: number): Promise<ServerStats[]> {
    if (!this.db) return [];
    return this.db.select().from(serverStats).orderBy(desc(serverStats.timestamp)).limit(limit);
  }
}