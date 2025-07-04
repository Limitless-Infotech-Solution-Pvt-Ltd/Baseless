import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertHostingPackageSchema, 
  insertDomainSchema, 
  insertEmailAccountSchema, 
  insertDatabaseSchema, 
  insertFileEntrySchema,
  insertServerStatsSchema
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
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
    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role || 'user'
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
      status: user.status
    });
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

  const httpServer = createServer(app);
  return httpServer;
}
