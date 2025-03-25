/* eslint-disable @typescript-eslint/no-explicit-any */

import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import { Session, User } from "next-auth";
import Usermodel from "@/model/User";
import dbConnect from "@/lib/dbConnect";
import bcrypt from "bcryptjs";
import GitHubProvider from "next-auth/providers/github";

 const authOptions = {
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