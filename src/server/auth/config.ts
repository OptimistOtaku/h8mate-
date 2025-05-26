import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "../mongodb";
import User from "../models/User";
import type { IUser } from "../models/User";
import type { Document } from "mongoose";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text", optional: true },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;
        const name = credentials.name as string | undefined;

        await connectToDatabase();

        try {
          // If it's a signup attempt (name is provided)
          if (name) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
              throw new Error("Email already exists");
            }

            const user = await User.create({
              email,
              password,
              name,
            });

            if (!user || !user._id) {
              throw new Error("Failed to create user");
            }

            return {
              id: user._id.toString(),
              email: user.email,
              name: user.name,
            };
          }

          // If it's a login attempt
          const user = await User.findOne({ email }).exec() as IUser | null;
          if (!user) {
            throw new Error("No user found with this email");
          }

          const isValid = await user.comparePassword(password);
          if (!isValid) {
            throw new Error("Invalid password");
          }

          if (!user._id) {
            throw new Error("User ID not found");
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.id as string,
      },
    }),
  },
  pages: {
    signIn: "/", // Custom sign-in page
  },
} satisfies NextAuthConfig;
