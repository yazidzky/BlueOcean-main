import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

const connectedUsers = new Map();

export const setupSocketHandlers = (io) => {
  // Socket.IO authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Store socket connection
    connectedUsers.set(socket.userId, socket.id);

    // Update user status to online
    User.findByIdAndUpdate(socket.userId, { status: "online" }).exec();

    // Broadcast user online status
    socket.broadcast.emit("user_status", {
      userId: socket.userId,
      status: "online",
    });

    // Join user's personal room
    socket.join(socket.userId);

    // Handle typing indicator
    socket.on("typing", (data) => {
      socket.to(data.recipientId).emit("user_typing", {
        userId: socket.userId,
        chatId: data.chatId,
      });
    });

    socket.on("stop_typing", (data) => {
      socket.to(data.recipientId).emit("user_stop_typing", {
        userId: socket.userId,
        chatId: data.chatId,
      });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`);
      connectedUsers.delete(socket.userId);

      // Update user status to offline
      User.findByIdAndUpdate(socket.userId, { status: "offline" }).exec();

      // Broadcast user offline status
      socket.broadcast.emit("user_status", {
        userId: socket.userId,
        status: "offline",
      });
    });
  });
};

export const getConnectedUsers = () => connectedUsers;
