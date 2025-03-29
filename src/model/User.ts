import mongoose, { Schema, Document } from "mongoose";
// Define the Message interface
export interface Message extends Document {
  content: string;
  createdAt: Date;
}
// Define the Message schema
const messageSchema: Schema<Message> = new Schema({
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

// Define the User interface
export interface User extends Document {
  username: string;
  email: string;
  password: string;
  verifyCode: string;
  verifyCodeExpiry: Date;
  isVerified: boolean;
  isAcceptingMessage: boolean;
  messages: Message[];
}

// Define the User schema
const userSchema: Schema<User> = new Schema({
  username: {
    type: String,
    required: [true, "Username is Required"],
    unique: true,
    trim: true,
    match: [/^[a-zA-Z0-9\s]*$/, "Special char is not allowed"],
  },
  email: {
    type: String,
    required: [true, "Email is Required"],
    unique: true,
    trim: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@gmail\.com$/, // Only allows Gmail addresses
      "Please provide a valid email address",
    ],
  },
  password: {
    type: String,
    required: [true, "Password is Required"],
  },
  verifyCode: {
    type: String,
    required: [true, "Verify code is Required"],
  },
  verifyCodeExpiry: {
    type: Date,
    required: [true, "Verify code expiry is Required"],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAcceptingMessage: {
    type: Boolean,
    default: true,
  },
  messages: [messageSchema],
});

// Create the User model
const Usermodel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", userSchema);
export default Usermodel;
