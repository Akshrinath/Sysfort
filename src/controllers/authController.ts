// src/controllers/authController.ts
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../config/db";
import dotenv from "dotenv";

dotenv.config();

// -----------------------------
// Active tokens store (in-memory)
// -----------------------------
const activeTokens = new Set<string>();

// -----------------------------
// Helper: Get JWT secret safely
// -----------------------------
const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("❌ JWT_SECRET is not defined in environment variables");
  return secret;
};

// -----------------------------
// Login Controller
// -----------------------------
export const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Username and password required" });

  try {
    const [rows]: any = await db.query("SELECT * FROM users WHERE username = ?", [username]);
    if (rows.length === 0) return res.status(401).json({ message: "Invalid username or password" });

    const user = rows[0];
    if (password !== user.password) return res.status(401).json({ message: "Invalid username or password" });

    // Create new JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        fname: user.fname,
        lname: user.lname,
        department: user.department,
        contactno: user.contactno,
        posting_date: user.posting_date,
        user_type: user.user_type,
        update_user: user.update_user,
        is_active: user.is_active,
      },
      getJwtSecret(),
      { expiresIn: "7d" }
    );

    // Save user in session and token in activeTokens
    req.session.user = { ...user, token };
    activeTokens.add(token);

    console.log("✅ Session & token created:", { user: req.session.user });

    return res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// -----------------------------
// Middleware: Check session + JWT
// -----------------------------
export const authenticateSessionAndJWT = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.user) return res.status(401).json({ message: "Session expired" });

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  if (!token || !activeTokens.has(token)) return res.status(401).json({ message: "Token invalid or expired" });

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { id: number; username: string };
    req.user = decoded;
    next();
  } catch {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// -----------------------------
// Check Session
// -----------------------------
export const checkSession = (req: Request, res: Response) => {
  if (!req.session.user) return res.status(401).json({ message: "No session found" });
  return res.json({ message: "✅ Session exists", user: req.session.user });
};

// -----------------------------
// Logout Controller
// -----------------------------
export const logoutUser = (req: Request, res: Response) => {
  if (!req.session.user) return res.status(400).json({ message: "No active session to logout" });

  const token = req.session.user.token;
  console.log(`🔒 Logging out user: ${req.session.user.username}, token: ${token}`);

  if (token) activeTokens.delete(token);

  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: "Failed to logout" });
    res.clearCookie("connect.sid", { path: "/" });
    return res.json({ message: "✅ Logged out successfully" });
  });
};

// -----------------------------
// Manual Destroy Session
// -----------------------------
export const destroySession = (req: Request, res: Response) => {
  if (!req.session.user) return res.status(400).json({ message: "No active session to destroy" });

  const token = req.session.user.token;
  console.log(`🛑 Destroying session for user: ${req.session.user.username}, token: ${token}`);

  if (token) activeTokens.delete(token);

  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: "Failed to destroy session" });
    res.clearCookie("connect.sid", { path: "/" });
    return res.json({ message: "✅ Session destroyed successfully" });
  });
};
