import mongoose from "mongoose";
import User from "../models/User.model.js";
import Task from "../models/Task.model.js";
import Chat from "../models/Chat.model.js";

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
    // Prefer DB name from URI path if provided, else env, else default
    const uriDbMatch = uri.match(/mongodb(?:\+srv)?:\/\/[^/]+\/(.*?)\?/);
    const dbNameFromUri = uriDbMatch?.[1];
    const dbName = dbNameFromUri || process.env.MONGODB_DB || "oceanbluee";

    mongoose.connection.on("connected", () => {
      console.log(`MongoDB connected to ${mongoose.connection.host}/${mongoose.connection.name}`);
    });
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err?.message);
    });
    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });

    const conn = await mongoose.connect(uri, { dbName });

    console.log(`MongoDB Connected: ${conn.connection.host}/${dbName}`);

    // Ensure collections exist (creates DB if missing)
    try {
      await Promise.all([
        User.createCollection().catch(() => {}),
        Task.createCollection().catch(() => {}),
        Chat.createCollection().catch(() => {}),
      ]);
      await Promise.all([User.init(), Task.init(), Chat.init()]);
      console.log("MongoDB collections initialized");
    } catch (e) {
      console.warn("Collection init warning:", e?.message);
    }
  } catch (error) {
    console.error(`Error connecting MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
