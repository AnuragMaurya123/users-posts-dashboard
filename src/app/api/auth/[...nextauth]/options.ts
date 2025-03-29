/* eslint-disable @typescript-eslint/no-explicit-any */

import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import { Session, User } from "next-auth";
import Usermodel from "@/model/User";
import dbConnect from "@/lib/dbConnect";
import bcrypt from "bcryptjs";
import GitHubProvider from "next-auth/providers/github";

const authOptions = {
  // adding providers
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials?: Record<"email" | "password", string>) {
        await dbConnect();
        // throwing error if credentials are not provided
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Credentials not provided");
        }
        try {
          //checking if the user exists
          const user = await Usermodel.findOne({
            $or: [
              { email: credentials.email },
              { username: credentials.email },
            ],
          });

          //returning the response if the user is not found
          if (!user) {
            throw new Error("User not found with this email or username");
          }
          //returning the response if the user is not verified
          if (!user.isVerified) {
            throw new Error("Please verify your account before logging in");
          }
          //comparing the password
          const isPasswordCorrect = await bcrypt.compare(
            String(credentials.password),
            user.password
          );
          //returning the response if the password is incorrect
          if (!isPasswordCorrect) {
            throw new Error("Incorrect Credentials");
          }
          return user as User;
        } catch (error) {
          // Throw the error directly instead of logging it
          throw error;
        }
      },
    }),
    // Add GitHub providers here
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
  ],
  // adding pages
  pages: {
    signIn: "/sign-in",
    signOut: "/sign-out",
  },
  callbacks: {
    //callback for jwt
    async jwt({
      token,
      user,
      account,
    }: {
      token: JWT;
      user?: User & { _id?: string; isVerified?: boolean; isAcceptingMessage?: boolean };
      account?: any; 
    }) {
      await dbConnect();

      // Preserve the existing token values if they exist
      if (token._id) {
        return token;
      }

      // Handle initial sign in
      if (user && user._id) {
        token._id = String(user._id);
        token.isVerified = user.isVerified ?? false;
        token.isAcceptingMessage = user.isAcceptingMessage ?? false;
        token.username = user.username ?? "";
        return token;
      }

      // Handle GitHub sign in
      if (account?.provider === "github") {
        try {
          // Fetch user details from GitHub
          const githubUserResponse = await fetch("https://api.github.com/user", {
            headers: {
              Authorization: `Bearer ${account.access_token}`,//passing the access token
            },
          });

          // Check if the request was successful
          if (!githubUserResponse.ok) {
            throw new Error("Failed to fetch GitHub user");
          }

          // Parse the GitHub user response
          const githubUser = await githubUserResponse.json();

          // throwing error if email is not provided
          if (!githubUser.email) {
            throw new Error("GitHub email not available");
          }

          // Check if the user already exists in the database
          const existingUser = await Usermodel.findOne({
            email: githubUser.email,
          });

          // If the user exists, update the token with their details
          if (existingUser && existingUser.verifyCode === "GITHUB_AUTH") {
            token._id = String(existingUser._id);
            token.isVerified = true;
            token.isAcceptingMessage = existingUser.isAcceptingMessage ?? false;
            token.username = existingUser.username;
          } else {
            // If the user doesn't exist, create a new user in the database
            // Generate a unique username from the GitHub username
            const sanitizedUsername = githubUser.login
              .replace(/[^a-zA-Z0-9_-]/g, "")
              .toLowerCase();
              //hashing the password
            const hashedPassword = await bcrypt.hash(String(githubUser.id), 10);
            // Create a new user in the database
            const newUser = await Usermodel.create({
              email: githubUser.email,
              username: sanitizedUsername,
              password: hashedPassword,
              verifyCode: "GITHUB_AUTH",
              verifyCodeExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
              isVerified: true,
              isAcceptingMessage: false,
            });

            // Update the token with the new user details
            token._id = String(newUser._id);
            token.isVerified = true;
            token.isAcceptingMessage = false;
            token.username = newUser.username;
          }
          return token;
        } catch (error) {
          // Log the error
          console.error("GitHub auth error:", error);
          throw error;
        }
      }
      console.log(token);
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      //if token is present then add it to session
      if (token && token._id && token._id !== 'undefined') {
        session.user = {
          ...session.user,
          _id: token._id,
          isVerified: token.isVerified ?? false,
          isAcceptingMessage: token.isAcceptingMessage ?? false,
          username: token.username ?? "",
        };
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    //setting the strategy to jwt
    strategy: "jwt" as const,
  },
};

export default authOptions;
