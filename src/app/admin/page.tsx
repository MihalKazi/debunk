"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import { 
  Upload, Loader2, Globe, MapPin, 
  ShieldCheck, ScanFace 
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    verdict: "Fake",
    severity: "medium",
    summary: "",
    platform: "",
    country: "",
    source: "",
    method: "",
    slug: "",
  });

  // --- LOGOUT FUNCTION ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Check if user is still logged in before submitting
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Session expired. Please log in again.");

      let mediaUrl = null;

      // 1. Upload Image
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('evidence')
          .upload(fileName, file);
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('evidence')
          .getPublicUrl(fileName);
        mediaUrl = publicUrl;
      }

      const slugToUse = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      // 2. Insert into DB
      const { error: dbError } = await supabase.from("debunks").insert([
        {
          ...formData,
          slug: slugToUse,
          media_url: mediaUrl,
          tags: [formData.platform || "General"], 
        },
      ]);

      if (dbError) throw dbError;

      setMessage("✅ Success! Case archived.");
      setFormData({ 
        title: "", verdict: "Fake", severity: "medium", summary: "", 
        platform: "", country: "", source: "", method: "", slug: "" 
      });
      setFile(null);

    } catch (error: any) {
      setMessage("❌ Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="bg-white p-8 shadow-lg rounded-xl border border-slate-200">
          <div className="flex justify-between items-start mb-6">
             <div>
                <h1 className="text-2xl font-bold text-[#1e3a5f] font-serif">Submit New Case</h1>
                <p className="text-slate-500 text-sm">Add a verified deepfake to the global archive.</p>
             </div>
             <button onClick={handleLogout} className="text-xs text-slate-400 hover:text-red-500 underline uppercase font-bold tracking-widest">
               Sign Out
             </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ... Your Form Inputs Stay Exactly The Same ... */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Case Title</label>
              <input
                type="text" required placeholder="e.g. Fabricated Disaster Footage"
                className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none text-slate-900"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* Platform & Region Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               <input type="text" placeholder="Platform" className="border p-2 rounded" value={formData.platform} onChange={e => setFormData({...formData, platform: e.target.value})} />
               <input type="text" placeholder="Region" className="border p-2 rounded" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
            </div>

            {/* Verdict & Severity */}
            <div className="grid grid-cols-2 gap-5">
              <select className="border p-2 rounded" value={formData.verdict} onChange={e => setFormData({...formData, verdict: e.target.value})}>
                <option>Fake</option><option>Satire</option><option>Altered</option>
              </select>
              <select className="border p-2 rounded" value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value})}>
                <option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
              </select>
            </div>

            {/* File Upload */}
            <div className="border-2 border-dashed p-4 text-center rounded">
                <input type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex justify-center items-center gap-2 rounded-lg bg-[#1e3a5f] py-3.5 text-white font-bold shadow hover:bg-black transition-all"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Submit to Archive"}
            </button>

            {message && <p className="text-center font-bold mt-4">{message}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}