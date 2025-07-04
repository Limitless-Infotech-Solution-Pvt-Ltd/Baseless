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
    // Create default hosting packages
    this.createHostingPackage({
      name: "Basic",
      diskSpace: 2,
      bandwidth: 20,
      emailAccounts: 5,
      databases: 2,
      domains: 1,
      status: "active"
    });

    this.createHostingPackage({
      name: "Standard",
      diskSpace: 5,
      bandwidth: 50,
      emailAccounts: 15,
      databases: 5,
      domains: 3,
      status: "active"
    });

    this.createHostingPackage({
      name: "Premium",
      diskSpace: 10,
      bandwidth: -1, // Unlimited
      emailAccounts: -1, // Unlimited
      databases: -1, // Unlimited
      domains: 10,
      status: "active"
    });

    // Create sample users
    this.createUser({
      username: "john.smith",
      email: "john.smith@example.com",
      password: "hashed_password",
      packageId: 3,
      status: "active",
      diskUsage: 2150
    });

    this.createUser({
      username: "sarah.johnson",
      email: "sarah.johnson@example.com",
      password: "hashed_password",
      packageId: 2,
      status: "active",
      diskUsage: 1500
    });

    // Create sample server stats
    this.createServerStats({
      cpuUsage: 23,
      memoryUsage: 67,
      diskUsage: 45,
      activeUsers: 247,
      uptime: 2592000 // 30 days
    });
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

export const storage = new MemStorage();
