import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/database.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import taskRoutes from "./routes/task.routes.js";
import friendRoutes from "./routes/friend.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import statsRoutes from "./routes/stats.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { setupSocketHandlers } from "./socket/handlers.js";

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const parseAllowedOrigins = () => {
  const envList = process.env.ALLOWED_ORIGINS || "";
  const client = process.env.CLIENT_URL || "http://localhost:5173";
  const defaults = [
    client,
    "http://localhost:4173",
    "http://localhost:8080",
  ];
  const items = envList
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const normalize = (u) => (u.endsWith("/") ? u.slice(0, -1) : u);
  const set = new Set([...defaults, ...items].map(normalize));
  return Array.from(set);
};

const allowedOrigins = parseAllowedOrigins();

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      const normalize = (u) => (u && u.endsWith("/") ? u.slice(0, -1) : u);
      const o = normalize(origin);
      if (!o || allowedOrigins.includes(o)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      const normalize = (u) => (u && u.endsWith("/") ? u.slice(0, -1) : u);
      const o = normalize(origin);
      if (!o || allowedOrigins.includes(o)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Make io accessible to routes
app.set("io", io);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/stats", statsRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Error handling middleware
app.use(errorHandler);

// Setup Socket.IO handlers
setupSocketHandlers(io);

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

export default app;
