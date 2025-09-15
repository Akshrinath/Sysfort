import session from "express-session";
import dotenv from "dotenv";

dotenv.config();

export const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // true if using HTTPS
    httpOnly: true,
    // maxAge: 1000 * 60 * 60, // 1 hour
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
});
