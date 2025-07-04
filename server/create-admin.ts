
import bcrypt from "bcrypt";
import { storage } from "./storage";

async function createAdmin() {
  try {
    const email = "Faisal@Baseless.com";
    const username = "admin";
    const password = "Love@Aadam";
    
    // Check if admin already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      console.log("Admin user already exists");
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create admin user
    const userData = {
      username,
      email,
      password: hashedPassword,
      packageId: 1,
      status: "active" as const,
      role: "admin"
    };

    const user = await storage.createUser(userData);
    console.log("Admin user created successfully:", {
      id: user.id,
      username: user.username,
      email: user.email,
      role: "admin"
    });
  } catch (error) {
    console.error("Failed to create admin user:", error);
  }
}

createAdmin();
