/* eslint-disable no-var */
import mongoose from "mongoose";

const MONGO_URL = process.env.MONGO_URL || "";

if (!MONGO_URL) {
  throw new Error("Please define the MONGO_URL environment variable");
}

// Extend the global object to include `mongoose`
declare global {
  var mongoose: { conn: mongoose.Connection | null; promise: Promise<mongoose.Connection> | null };
}

// Initialize `global.mongoose` if it doesn't exist
global.mongoose = global.mongoose || { conn: null, promise: null };

const dbConnect = async (): Promise<mongoose.Connection> => {
  try {
    if (global.mongoose.conn) {
      console.log("Using existing database connection");
      return global.mongoose.conn;
    }

    if (!global.mongoose.promise) {
      console.log("Creating new database connection...");
      global.mongoose.promise = mongoose
        .connect(MONGO_URL)
        .then((mongoose) => mongoose.connection);
    }

    global.mongoose.conn = await global.mongoose.promise;
    console.log("Database connected successfully");
    return global.mongoose.conn;
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
};

export default dbConnect;
