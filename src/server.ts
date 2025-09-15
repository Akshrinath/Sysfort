import express from "express";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import { sessionMiddleware } from "./config/session";

dotenv.config();
const app = express();

app.use(express.json());
app.use(sessionMiddleware);

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
