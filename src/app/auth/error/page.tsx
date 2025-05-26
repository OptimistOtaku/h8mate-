"use client";

import { useSearchParams } from "next/navigation";

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="rounded-lg bg-gray-800 p-8 text-center">
        <h1 className="mb-4 text-2xl font-bold text-white">Authentication Error</h1>
        <p className="text-red-400">{error || "An error occurred during authentication"}</p>
      </div>
    </div>
  );
} 