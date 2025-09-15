// src/types/express.d.ts
import "express-session";
import { JwtPayload } from "jsonwebtoken";

declare module "express-session" {
  interface SessionData {
    user?: { 
      id: string; 
      username: string;
      email: string;
      fname: string; 
      lname: string; 
      department: string; 
      contactno: string; 
      posting_date: string; 
      user_type: string; 
      update_user: string; 
      is_active: string; 
     };
  }
}

declare module "express-serve-static-core" {
  interface Request {
    user?: string | JwtPayload; // decoded JWT payload
  }
}
