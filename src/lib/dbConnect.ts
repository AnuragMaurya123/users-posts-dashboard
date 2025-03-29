/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";

export const runtime = "edge";
const MONGO_URL = process.env.MONGO_URL || "";

if (!MONGO_URL) {
  throw new Error("MONGO_URL is not defined in environment variables.");
}

// Use a cached connection to avoid re-connecting on every request
const cached = (global as any).mongoose || { conn: null, promise: null };

const dbConnect = async () => {
  if (cached.conn) {
    console.log("Using existing database connection");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("Creating new database connection...");
    cached.promise = mongoose.connect(MONGO_URL).then((mongoose) => {
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

(global as any).mongoose = cached; // Store connection globally

export default dbConnect;
