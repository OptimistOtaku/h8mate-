"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-xl shadow-xl max-w-md w-full mx-4">
        <h1 className="text-2xl font-bold text-white mb-4">Authentication Error</h1>
        <p className="text-white/90 mb-6">
          {error === "CredentialsSignin"
            ? "Invalid email or password. Please try again."
            : error || "An error occurred during authentication."}
        </p>
        <div className="space-y-4">
          <Link
            href="/"
            className="block w-full text-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/?auth=signin"
            className="block w-full text-center px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
          >
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
} 