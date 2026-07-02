"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError("Incorrect email or password");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <form onSubmit={handleLogin} className="p-8 bg-white rounded-xl shadow-lg border border-slate-200 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-[#1e3a5f]">Staff Login</h1>
        <input
          type="email"
          className="w-full p-3 border rounded-lg mb-4 outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="username"
        />
        <input
          type="password"
          className="w-full p-3 border rounded-lg mb-4 outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-[#1e3a5f] text-white py-3 rounded-lg font-bold disabled:opacity-50">
          {loading ? "Signing in..." : "Access Dashboard"}
        </button>
      </form>
    </div>
  );
}
