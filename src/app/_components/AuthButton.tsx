"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <button
        disabled
        className="rounded-lg bg-gray-500 px-4 py-2 text-white"
      >
        Loading...
      </button>
    );
  }

  if (status === "authenticated") {
    return (
        <button
          onClick={() => void signOut()}
        className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
        Sign Out
        </button>
    );
  }

  return (
      <button
      onClick={() => void signIn()}
      className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                >
      Sign In
            </button>
  );
}
