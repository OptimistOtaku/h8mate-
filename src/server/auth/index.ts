import NextAuth from "next-auth";
import { authConfig } from "./config";

export const { auth, signIn, signOut, handlers } = NextAuth(authConfig);

// Export auth config for use in other files
export { authConfig };
