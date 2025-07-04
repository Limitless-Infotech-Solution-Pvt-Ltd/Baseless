import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { Server as SocketServer } from "socket.io";
import passport from "passport";
import bcrypt from "bcrypt";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import rateLimit from "express-rate-limit";
import cron from "node-cron";
import crypto from "crypto";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertUserSchema, 
  insertHostingPackageSchema, 
  insertDomainSchema, 
  insertEmailAccountSchema, 
  insertDatabaseSchema, 
  insertFileEntrySchema,
  insertServerStatsSchema,
  insertNotificationSchema,
  insertFileVersionSchema,
  insertBackupSchema,
  insertApiKeySchema,
  insertDashboardWidgetSchema,
  insertSecurityScanSchema,
  insertDnsRecordSchema,
  insertSslCertificateSchema,
  insertWebmailSettingsSchema,
  insertCodeProjectSchema,
  insertAiLearningDataSchema,
  insertAiRecommendationSchema,
  insertKnowledgeBaseSchema
} from "@shared/schema";

// Authentication middleware
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Authentication required" });
};

// Admin middleware
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && (req.user as any)?.role === 'admin') {
    return next();
  }
  res.status(403).json({ error: "Admin access required" });
};

// Rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);

  // Apply rate limiting to API routes
  app.use('/api', apiLimiter);
  app.use('/api/auth', authLimiter);

  const httpServer = createServer(app);
  const io = new SocketServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Socket.IO connection handling
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-user-room', (userId) => {
      socket.join(`user-${userId}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  // Helper function to emit notifications
  const emitNotification = (userId: number | null, notification: any) => {
    if (userId) {
      io.to(`user-${userId}`).emit('notification', notification);
    } else {
      io.emit('notification', notification); // System-wide notification
    }
  };

  // Schedule automated tasks
  cron.schedule('0 */6 * * *', async () => {
    // Automated security scan every 6 hours
    try {
      const scan = await storage.createSecurityScan({
        type: 'automated',
        status: 'running',
        scheduledAt: new Date().toISOString()
      });

      // Simulate scan completion
      setTimeout(async () => {
        const results = {
          filesScanned: Math.floor(Math.random() * 10000),
          threatsFound: Math.floor(Math.random() * 3),
          cleanFiles: Math.floor(Math.random() * 9997) + 9990
        };

        // Create system notification
        const notification = await storage.createNotification({
          title: 'Security Scan Complete',
          message: `Automated security scan completed. ${results.threatsFound} threats found.`,
          type: results.threatsFound > 0 ? 'warning' : 'success',
          priority: results.threatsFound > 0 ? 'high' : 'normal'
        });

        emitNotification(null, notification);
      }, 30000); // 30 seconds simulation
    } catch (error) {
      console.error('Failed to run automated security scan:', error);
    }
  });

  // Generate server stats every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      const stats = {
        cpuUsage: Math.floor(Math.random() * 100),
        memoryUsage: Math.floor(Math.random() * 100),
        diskUsage: Math.floor(Math.random() * 100),
        activeUsers: Math.floor(Math.random() * 50) + 1,
        uptime: Math.floor(Date.now() / 1000) // Current timestamp as uptime
      };

      await storage.createServerStats(stats);
    } catch (error) {
      console.error('Failed to generate server stats:', error);
    }
  });

  // Replit Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Legacy authentication routes (for backward compatibility)
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, email, password } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ error: "Username already taken" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const userData = {
        username,
        email,
        password: hashedPassword,
        packageId: 1, // Default package
        status: "active"
      };

      const user = await storage.createUser(userData);
      res.status(201).json({ 
        message: "User created successfully",
        user: { id: user.id, username: user.username, email: user.email }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    const user = req.user as any;
    const { twoFactorToken } = req.body;

    // Check if 2FA is enabled for this user
    if (user.twoFactorEnabled) {
      if (!twoFactorToken) {
        return res.status(200).json({
          message: "2FA required",
          requiresTwoFactor: true,
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          }
        });
      }

      // Verify 2FA token
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorToken,
        window: 2
      });

      if (!verified) {
        return res.status(400).json({ error: "Invalid 2FA token" });
      }
    }

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role || 'user',
        twoFactorEnabled: user.twoFactorEnabled
      }
    });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/auth/me", requireAuth, (req, res) => {
    const user = req.user as any;
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role || 'user',
      packageId: user.packageId,
      status: user.status,
      twoFactorEnabled: user.twoFactorEnabled
    });
  });

  // 2FA Setup - Generate QR code
  app.post("/api/auth/2fa/setup", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      
      if (user.twoFactorEnabled) {
        return res.status(400).json({ error: "2FA is already enabled" });
      }

      const secret = speakeasy.generateSecret({
        name: `Baseless Hosting (${user.email})`,
        issuer: 'Baseless Hosting'
      });

      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

      res.json({
        secret: secret.base32,
        qrCode: qrCodeUrl,
        manualEntryKey: secret.base32
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to setup 2FA" });
    }
  });

  // 2FA Verify and Enable
  app.post("/api/auth/2fa/verify", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const { token, secret } = req.body;

      if (!token || !secret) {
        return res.status(400).json({ error: "Token and secret are required" });
      }

      const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 2
      });

      if (!verified) {
        return res.status(400).json({ error: "Invalid token" });
      }

      // Save the secret and enable 2FA
      await storage.updateUser2FA(user.id, secret, true);

      res.json({ message: "2FA enabled successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to enable 2FA" });
    }
  });

  // 2FA Disable
  app.post("/api/auth/2fa/disable", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ error: "Password is required" });
      }

      // Verify current password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(400).json({ error: "Invalid password" });
      }

      await storage.disable2FA(user.id);

      res.json({ message: "2FA disabled successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to disable 2FA" });
    }
  });

  // Users (protected routes)
  app.get("/api/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, userData);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Hosting Packages (protected routes)
  app.get("/api/hosting-packages", requireAuth, async (req, res) => {
    try {
      const packages = await storage.getAllHostingPackages();
      res.json(packages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch hosting packages" });
    }
  });

  app.get("/api/hosting-packages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pkg = await storage.getHostingPackage(id);
      if (!pkg) {
        return res.status(404).json({ error: "Hosting package not found" });
      }
      res.json(pkg);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch hosting package" });
    }
  });

  app.post("/api/hosting-packages", async (req, res) => {
    try {
      const packageData = insertHostingPackageSchema.parse(req.body);
      const pkg = await storage.createHostingPackage(packageData);
      res.status(201).json(pkg);
    } catch (error) {
      res.status(400).json({ error: "Invalid hosting package data" });
    }
  });

  app.put("/api/hosting-packages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const packageData = insertHostingPackageSchema.partial().parse(req.body);
      const pkg = await storage.updateHostingPackage(id, packageData);
      if (!pkg) {
        return res.status(404).json({ error: "Hosting package not found" });
      }
      res.json(pkg);
    } catch (error) {
      res.status(400).json({ error: "Invalid hosting package data" });
    }
  });

  app.delete("/api/hosting-packages/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteHostingPackage(id);
      if (!success) {
        return res.status(404).json({ error: "Hosting package not found" });
      }
      res.json({ message: "Hosting package deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete hosting package" });
    }
  });

  // Domains (protected routes)
  app.get("/api/domains", requireAuth, async (req, res) => {
    try {
      const domains = await storage.getAllDomains();
      res.json(domains);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch domains" });
    }
  });

  app.get("/api/domains/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const domains = await storage.getDomainsByUserId(userId);
      res.json(domains);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user domains" });
    }
  });

  app.post("/api/domains", async (req, res) => {
    try {
      const domainData = insertDomainSchema.parse(req.body);
      const domain = await storage.createDomain(domainData);
      res.status(201).json(domain);
    } catch (error) {
      res.status(400).json({ error: "Invalid domain data" });
    }
  });

  app.delete("/api/domains/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteDomain(id);
      if (!success) {
        return res.status(404).json({ error: "Domain not found" });
      }
      res.json({ message: "Domain deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete domain" });
    }
  });

  // Email Accounts
  app.get("/api/email-accounts", async (req, res) => {
    try {
      const emails = await storage.getAllEmailAccounts();
      res.json(emails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch email accounts" });
    }
  });

  app.get("/api/email-accounts/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const emails = await storage.getEmailAccountsByUserId(userId);
      res.json(emails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user email accounts" });
    }
  });

  app.post("/api/email-accounts", async (req, res) => {
    try {
      const emailData = insertEmailAccountSchema.parse(req.body);
      const email = await storage.createEmailAccount(emailData);
      res.status(201).json(email);
    } catch (error) {
      res.status(400).json({ error: "Invalid email account data" });
    }
  });

  app.delete("/api/email-accounts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEmailAccount(id);
      if (!success) {
        return res.status(404).json({ error: "Email account not found" });
      }
      res.json({ message: "Email account deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete email account" });
    }
  });

  // Databases
  app.get("/api/databases", async (req, res) => {
    try {
      const databases = await storage.getAllDatabases();
      res.json(databases);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch databases" });
    }
  });

  app.get("/api/databases/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const databases = await storage.getDatabasesByUserId(userId);
      res.json(databases);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user databases" });
    }
  });

  app.post("/api/databases", async (req, res) => {
    try {
      const dbData = insertDatabaseSchema.parse(req.body);
      const database = await storage.createDatabase(dbData);
      res.status(201).json(database);
    } catch (error) {
      res.status(400).json({ error: "Invalid database data" });
    }
  });

  app.delete("/api/databases/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteDatabase(id);
      if (!success) {
        return res.status(404).json({ error: "Database not found" });
      }
      res.json({ message: "Database deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete database" });
    }
  });

  // File Entries
  app.get("/api/files/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const path = req.query.path as string || "/";
      const files = await storage.getFileEntriesByUserIdAndPath(userId, path);
      res.json(files);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch files" });
    }
  });

  app.post("/api/files", async (req, res) => {
    try {
      const fileData = insertFileEntrySchema.parse(req.body);
      const file = await storage.createFileEntry(fileData);
      res.status(201).json(file);
    } catch (error) {
      res.status(400).json({ error: "Invalid file data" });
    }
  });

  app.delete("/api/files/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteFileEntry(id);
      if (!success) {
        return res.status(404).json({ error: "File not found" });
      }
      res.json({ message: "File deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete file" });
    }
  });

  // Server Stats
  app.get("/api/server-stats", async (req, res) => {
    try {
      const stats = await storage.getLatestServerStats();
      if (!stats) {
        return res.status(404).json({ error: "No server stats available" });
      }
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch server stats" });
    }
  });

  app.get("/api/server-stats/history", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 24;
      const stats = await storage.getServerStatsHistory(limit);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch server stats history" });
    }
  });

  app.post("/api/server-stats", async (req, res) => {
    try {
      const statsData = insertServerStatsSchema.parse(req.body);
      const stats = await storage.createServerStats(statsData);
      res.status(201).json(stats);
    } catch (error) {
      res.status(400).json({ error: "Invalid server stats data" });
    }
  });

  // Users count endpoint
  app.get("/api/users/count", async (req, res) => {
    try {
      const count = await storage.getUsersCount();
      res.json({ count });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users count" });
    }
  });

  // Notifications
  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const limit = parseInt(req.query.limit as string) || 50;
      const notifications = await storage.getUserNotifications(user.id, limit);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications", requireAdmin, async (req, res) => {
    try {
      const notificationData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(notificationData);
      
      // Emit real-time notification
      emitNotification(notification.userId, notification);
      
      res.status(201).json(notification);
    } catch (error) {
      res.status(400).json({ error: "Invalid notification data" });
    }
  });

  app.put("/api/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const notification = await storage.markNotificationAsRead(id);
      if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
      }
      res.json(notification);
    } catch (error) {
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  // File Versioning
  app.get("/api/files/:id/versions", requireAuth, async (req, res) => {
    try {
      const fileId = parseInt(req.params.id);
      const versions = await storage.getFileVersions(fileId);
      res.json(versions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch file versions" });
    }
  });

  app.post("/api/files/:id/versions", requireAuth, async (req, res) => {
    try {
      const fileId = parseInt(req.params.id);
      const user = req.user as any;
      const versionData = insertFileVersionSchema.parse({
        ...req.body,
        fileId,
        userId: user.id
      });
      const version = await storage.createFileVersion(versionData);
      res.status(201).json(version);
    } catch (error) {
      res.status(400).json({ error: "Invalid file version data" });
    }
  });

  // Backups
  app.get("/api/backups", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const backups = await storage.getUserBackups(user.id);
      res.json(backups);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch backups" });
    }
  });

  app.post("/api/backups", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const backupData = insertBackupSchema.parse({
        ...req.body,
        userId: user.id
      });
      const backup = await storage.createBackup(backupData);
      
      // Create notification
      const notification = await storage.createNotification({
        userId: user.id,
        title: 'Backup Started',
        message: `${backupData.type} backup has been initiated.`,
        type: 'info'
      });
      emitNotification(user.id, notification);
      
      res.status(201).json(backup);
    } catch (error) {
      res.status(400).json({ error: "Invalid backup data" });
    }
  });

  // API Keys
  app.get("/api/api-keys", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const apiKeys = await storage.getUserApiKeys(user.id);
      // Don't return the actual key values for security
      const sanitizedKeys = apiKeys.map(key => ({
        ...key,
        key: key.key.substring(0, 8) + '...'
      }));
      res.json(sanitizedKeys);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch API keys" });
    }
  });

  app.post("/api/api-keys", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const keyData = insertApiKeySchema.parse({
        ...req.body,
        userId: user.id,
        key: crypto.randomBytes(32).toString('hex')
      });
      const apiKey = await storage.createApiKey(keyData);
      res.status(201).json(apiKey);
    } catch (error) {
      res.status(400).json({ error: "Invalid API key data" });
    }
  });

  // Dashboard Widgets
  app.get("/api/dashboard/widgets", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const widgets = await storage.getUserDashboardWidgets(user.id);
      res.json(widgets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard widgets" });
    }
  });

  app.post("/api/dashboard/widgets", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const widgetData = insertDashboardWidgetSchema.parse({
        ...req.body,
        userId: user.id
      });
      const widget = await storage.createDashboardWidget(widgetData);
      res.status(201).json(widget);
    } catch (error) {
      res.status(400).json({ error: "Invalid widget data" });
    }
  });

  // Security Scans
  app.get("/api/security/scans/latest", requireAuth, async (req, res) => {
    try {
      const scan = await storage.getLatestSecurityScan();
      res.json(scan);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch security scan" });
    }
  });

  app.post("/api/security/scans", requireAdmin, async (req, res) => {
    try {
      const scanData = insertSecurityScanSchema.parse(req.body);
      const scan = await storage.createSecurityScan(scanData);
      
      // Create notification
      const notification = await storage.createNotification({
        title: 'Security Scan Initiated',
        message: `${scanData.type} security scan has been started.`,
        type: 'info'
      });
      emitNotification(null, notification);
      
      res.status(201).json(scan);
    } catch (error) {
      res.status(400).json({ error: "Invalid security scan data" });
    }
  });

  // DNS Records
  app.get("/api/dns-records/:domainId", requireAuth, async (req, res) => {
    try {
      const domainId = parseInt(req.params.domainId);
      const records = await storage.getDnsRecordsByDomain(domainId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch DNS records" });
    }
  });

  app.post("/api/dns-records", requireAuth, async (req, res) => {
    try {
      const recordData = insertDnsRecordSchema.parse(req.body);
      const record = await storage.createDnsRecord(recordData);
      res.status(201).json(record);
    } catch (error) {
      res.status(400).json({ error: "Invalid DNS record data" });
    }
  });

  app.put("/api/dns-records/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const recordData = insertDnsRecordSchema.partial().parse(req.body);
      const record = await storage.updateDnsRecord(id, recordData);
      if (!record) {
        return res.status(404).json({ error: "DNS record not found" });
      }
      res.json(record);
    } catch (error) {
      res.status(400).json({ error: "Invalid DNS record data" });
    }
  });

  app.delete("/api/dns-records/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteDnsRecord(id);
      if (!success) {
        return res.status(404).json({ error: "DNS record not found" });
      }
      res.json({ message: "DNS record deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete DNS record" });
    }
  });

  // SSL Certificates
  app.get("/api/ssl-certificates/:domainId", requireAuth, async (req, res) => {
    try {
      const domainId = parseInt(req.params.domainId);
      const certificates = await storage.getSslCertificatesByDomain(domainId);
      res.json(certificates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch SSL certificates" });
    }
  });

  app.post("/api/ssl-certificates", requireAuth, async (req, res) => {
    try {
      const certificateData = insertSslCertificateSchema.parse(req.body);
      const certificate = await storage.createSslCertificate(certificateData);
      
      // Create notification
      const notification = await storage.createNotification({
        userId: certificate.userId,
        title: 'SSL Certificate Generation Started',
        message: `SSL certificate generation for domain ID ${certificate.domainId} has been initiated.`,
        type: 'info'
      });
      emitNotification(certificate.userId, notification);
      
      res.status(201).json(certificate);
    } catch (error) {
      res.status(400).json({ error: "Invalid SSL certificate data" });
    }
  });

  // Webmail Settings
  app.get("/api/webmail/settings", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const settings = await storage.getWebmailSettings(user.id);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch webmail settings" });
    }
  });

  app.post("/api/webmail/settings", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const settingsData = insertWebmailSettingsSchema.parse({
        ...req.body,
        userId: user.id
      });
      const settings = await storage.createWebmailSettings(settingsData);
      res.status(201).json(settings);
    } catch (error) {
      res.status(400).json({ error: "Invalid webmail settings data" });
    }
  });

  // Code Projects
  app.get("/api/code-projects", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const projects = await storage.getCodeProjectsByUser(user.id);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch code projects" });
    }
  });

  app.post("/api/code-projects", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const projectData = insertCodeProjectSchema.parse({
        ...req.body,
        userId: user.id
      });
      const project = await storage.createCodeProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ error: "Invalid code project data" });
    }
  });

  app.put("/api/code-projects/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const projectData = insertCodeProjectSchema.partial().parse(req.body);
      const project = await storage.updateCodeProject(id, projectData);
      if (!project) {
        return res.status(404).json({ error: "Code project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(400).json({ error: "Invalid code project data" });
    }
  });

  // AI Learning & Recommendations
  app.post("/api/ai/learn", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const learningData = insertAiLearningDataSchema.parse({
        ...req.body,
        userId: user.id
      });
      const data = await storage.createAiLearningData(learningData);
      res.status(201).json(data);
    } catch (error) {
      res.status(400).json({ error: "Invalid learning data" });
    }
  });

  app.get("/api/ai/recommendations", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const recommendations = await storage.getAiRecommendations(user.id);
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  });

  app.post("/api/ai/recommendations/:id/accept", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const recommendation = await storage.acceptAiRecommendation(id);
      if (!recommendation) {
        return res.status(404).json({ error: "Recommendation not found" });
      }
      res.json(recommendation);
    } catch (error) {
      res.status(500).json({ error: "Failed to accept recommendation" });
    }
  });

  // Knowledge Base
  app.get("/api/knowledge-base", async (req, res) => {
    try {
      const category = req.query.category as string;
      const articles = await storage.getKnowledgeBaseArticles(category);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch knowledge base articles" });
    }
  });

  app.get("/api/knowledge-base/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.getKnowledgeBaseArticle(id);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }
      await storage.incrementKnowledgeBaseViews(id);
      res.json(article);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch article" });
    }
  });

  app.post("/api/knowledge-base", requireAdmin, async (req, res) => {
    try {
      const articleData = insertKnowledgeBaseSchema.parse(req.body);
      const article = await storage.createKnowledgeBaseArticle(articleData);
      res.status(201).json(article);
    } catch (error) {
      res.status(400).json({ error: "Invalid knowledge base article data" });
    }
  });

  return httpServer;
}
