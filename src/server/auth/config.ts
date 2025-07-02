import type { NextAuthConfig, DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { supabase } from "../../lib/supabase";

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
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text", optional: true },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password");
        }

        const email = credentials.email as string;
        const password = credentials.password as string;
        const name = credentials.name as string | undefined;

        try {
          // Check if user exists
          const { data: existingUser, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

          if (userError || !existingUser) {
            // If user doesn't exist and name is provided, create new user
            if (name) {
              const { data: newUser, error: signUpError } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                  data: {
                    name: name,
                  }
                }
              });

              if (signUpError) {
                throw new Error(signUpError.message);
              }

              if (newUser.user) {
                // Insert user data into users table
                const { error: insertError } = await supabase
                  .from('users')
                  .insert({
                    id: newUser.user.id,
                    email: email,
                    name: name,
                  });

                if (insertError) {
                  throw new Error(insertError.message);
                }

                return {
                  id: newUser.user.id,
                  email: email,
                  name: name,
                };
              }
            } else {
              throw new Error("No account found with this email. Please sign up first.");
            }
          } else {
            // User exists, try to sign in
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: email,
              password: password,
            });

            if (signInError) {
              throw new Error("Incorrect password. Please try again.");
            }

            if (signInData.user) {
              return {
                id: signInData.user.id,
                email: email,
                name: existingUser.name,
              };
            }
          }
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/auth/error",
  },
} satisfies NextAuthConfig;
