// src/routes/authRoutes.ts
import express from "express";
import { loginUser, authenticateJWT } from "../controllers/authController";

const router = express.Router();

router.post("/login", loginUser);
// router.post("/login", (req, res, next) => {
//   console.log("Route /login called");
//   next();
// }, loginUser);
router.get("/profile", authenticateJWT, (req, res) => {
  res.json({ message: "Protected profile", user: req.user });
});

export default router;
