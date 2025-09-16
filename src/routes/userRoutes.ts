import express from "express";
import { getUsers } from "../controllers/userController";
import { authenticateSessionAndJWT } from "../controllers/authController";


const router = express.Router();

router.get("/", authenticateSessionAndJWT, getUsers);

export default router;
