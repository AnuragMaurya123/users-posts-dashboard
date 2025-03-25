/* eslint-disable @typescript-eslint/no-explicit-any */

import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import { Session, User } from "next-auth";
import Usermodel from "@/model/User";
import dbConnect from "@/lib/dbConnect";
import bcrypt from "bcryptjs";
import GitHubProvider from "next-auth/providers/github";

 const authOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials:any){
        await dbConnect();
        if (!credentials.email || !credentials.password) {
          throw new Error("Credentials not provided");
        }
        try {
          const user = await Usermodel.findOne({
            $or: [{ email: credentials.email }, { username: credentials.email }],
          });
          
          if (!user) {
            throw new Error("User not found with this email or username");
          }
          if (!user.isVerified) {
            throw new Error("Please verify your account before logging in");
          }

          const isPasswordCorrect = await bcrypt.compare(String(credentials.password) , user.password);
          if (!isPasswordCorrect) {
            throw new Error("Incorrect Credentials");
          }
          return user as any;
        } catch (error) {
          // Throw the error directly instead of logging it
          throw error;
        }
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string
    })
  ],
  pages: {
    signIn: "/sign-in",
    signOut: "/sign-out",
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User & { _id?: string } }) {
      if (user) {
        token._id = user._id ? String(user._id) : "";
        token.isVerified = user.isVerified ?? false;
        token.isAcceptingMessage = user.isAcceptingMessage ?? false;
        token.username = user.username ?? "";
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        session.user = {
          ...session.user,
          _id: token._id ?? "",
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
    strategy: "jwt" as const
  }
};

export default authOptions