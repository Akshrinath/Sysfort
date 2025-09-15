import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../config/db";
import dotenv from "dotenv";

dotenv.config();

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

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    // Fetch user
    const [rows]: any = await db.query("SELECT * FROM users WHERE username = ?", [username]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const user = rows[0];

    // ✅ For now using plain text password check (replace with bcrypt later)
    if (password !== user.password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Uncomment for bcrypt later
    // const isPasswordValid = await bcrypt.compare(password, user.password);
    // if (!isPasswordValid) {
    //   return res.status(401).json({ message: "Invalid username or password" });
    // }

    // ✅ Create JWT
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

    // ✅ Save session
    req.session.user = { 
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
    };

    // Convert session expiry to IST for logging
    const utcExpire = req.session.cookie.expires;
    const localExpire = utcExpire
      ? new Date(utcExpire).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      : null;

    console.log("✅ Session created:", {
      cookie: {
        path: req.session.cookie.path,
        expiresUTC: utcExpire,
        expiresLocal: localExpire,
        originalMaxAge: req.session.cookie.originalMaxAge,
        httpOnly: req.session.cookie.httpOnly,
        secure: req.session.cookie.secure,
      },
      user: req.session.user,
    });

    return res.json({
      message: "Login successful",
      token,
      session: {
        user: req.session.user,
        expiresUTC: utcExpire,
        expiresLocal: localExpire,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// -----------------------------
// Middleware to protect routes using JWT
// -----------------------------
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token missing" });

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { id: number; username: string };
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// -----------------------------
// Session Check (for debugging)
// -----------------------------
export const checkSession = (req: Request, res: Response) => {
  if (req.session.user) {
    const utcExpire = req.session.cookie.expires;
    const localExpire = utcExpire
      ? new Date(utcExpire).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      : null;

    return res.json({
      message: "✅ Session exists",
      user: req.session.user,
      expiresUTC: utcExpire,
      expiresLocal: localExpire,
    });
  } else {
    return res.status(401).json({ message: "❌ No session found" });
  }
};

// -----------------------------
// Logout Controller
// -----------------------------
export const logoutUser = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Failed to logout" });
    }
    res.clearCookie("connect.sid"); // clear cookie
    return res.json({ message: "Logged out successfully" });
  });
};
