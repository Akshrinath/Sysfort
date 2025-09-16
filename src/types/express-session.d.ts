import "express-session";

declare module "express-session" {
  interface SessionData {
    user?: { 
      token: string;
      id: number; 
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
