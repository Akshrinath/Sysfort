// src/routes/authRoutes.ts
import express from "express";
import { 
  loginUser, 
  authenticateSessionAndJWT,
  logoutUser, 
  destroySession, 
  checkSession 
} from "../controllers/authController";

const router = express.Router();

// -----------------------------
// Auth routes
// -----------------------------
router.post("/login", loginUser);

// Protected route example
router.get("/profile", authenticateSessionAndJWT, (req, res) => {
  res.json({ message: "Protected profile", user: req.user });
});

// Logout route (logged-in users)
router.post("/checkSession", checkSession);
router.post("/logout", logoutUser);

// Destroy session route (manual session destroy, e.g. admin use)
router.delete("/destroySession", destroySession);


export default router;
