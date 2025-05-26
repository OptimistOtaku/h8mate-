"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";

export function AuthButton() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        name: isSignUp ? name : undefined,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        setIsOpen(false);
        setEmail("");
        setPassword("");
        setName("");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <button
        className="fixed top-4 right-4 px-4 py-2 rounded-lg bg-purple-600/50 text-white/50"
        disabled
      >
        Loading...
      </button>
    );
  }

  if (session) {
    return (
      <div className="fixed top-4 right-4 flex items-center gap-4">
        <span className="text-white/80">Hello, {session.user.name}</span>
        <button
          className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          onClick={() => void signOut()}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        className="fixed top-4 right-4 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
        onClick={() => setIsOpen(true)}
      >
        Sign in
      </button>      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md relative">
            <h2 className="text-2xl font-bold text-white mb-6">
              {isSignUp ? "Create Account" : "Sign In"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label htmlFor="name" className="block text-white mb-1">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                    required={isSignUp}
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-white mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-white mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                  required
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {isLoading
                    ? "Loading..."
                    : isSignUp
                    ? "Create Account"
                    : "Sign In"}
                </button>

                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="w-full text-purple-400 hover:text-purple-300 transition-colors text-sm"
                >
                  {isSignUp
                    ? "Already have an account? Sign in"
                    : "Need an account? Sign up"}
                </button>
              </div>
            </form>

            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
