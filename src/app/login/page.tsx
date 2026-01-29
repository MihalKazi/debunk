"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  const UNIVERSAL_PASSWORD = "debunker@2025"; 

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === UNIVERSAL_PASSWORD) {
      // Set a cookie that lasts 24 hours
      document.cookie = "admin_access=true; path=/; max-age=86400; SameSite=Strict";
      router.push("/admin");
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <form onSubmit={handleLogin} className="p-8 bg-white rounded-xl shadow-lg border border-slate-200 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-[#1e3a5f]">Staff Login</h1>
        <input
          type="password"
          className="w-full p-3 border rounded-lg mb-4 outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Enter Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm mb-4">Incorrect Password</p>}
        <button className="w-full bg-[#1e3a5f] text-white py-3 rounded-lg font-bold">Access Dashboard</button>
      </form>
    </div>
  );
}  