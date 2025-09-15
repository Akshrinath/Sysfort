import { Request, Response } from "express";
import { db } from "../config/db";

export const getUsers = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query("SELECT id, fname, email FROM users"); // safe fields only
    res.json(rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};
