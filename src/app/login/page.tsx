"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      // Use refresh to ensure middleware picks up the new cookie
      router.refresh(); 
      router.push("/admin");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex justify-center mb-6 text-[#1e3a5f]">
          <ShieldCheck size={48} className="animate-pulse" />
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-2 text-slate-800">Staff Access</h1>
        <p className="text-center text-slate-500 text-sm mb-8">Secure Archive Management</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" placeholder="Admin Email" required 
            className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            value={email} onChange={e => setEmail(e.target.value)}
          />
          <input 
            type="password" placeholder="Password" required 
            className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            value={password} onChange={e => setPassword(e.target.value)}
          />
          
          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <button 
            disabled={loading} 
            className="w-full bg-[#1e3a5f] text-white py-3 rounded-lg font-bold hover:bg-black transition-all flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Verify Identity"}
          </button>
        </form>
      </div>
    </div>
  );
}