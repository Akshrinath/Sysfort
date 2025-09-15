import express from "express";
import { getUsers } from "../controllers/userController";
import { authenticateJWT } from "../controllers/authController";

const router = express.Router();

router.get("/", authenticateJWT, getUsers);

export default router;
