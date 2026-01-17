"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import { Upload, Loader2, Globe, MapPin, ShieldCheck, ScanFace } from "lucide-react";

export default function SubmitPage() {
  const [formData, setFormData] = useState({
    title: "",
    verdict: "Fake",
    severity: "medium",
    summary: "",
    platform: "", // <--- NEW
    country: "",  // (Region)
    source: "",   // (Verified By)
    method: "",   // <--- NEW
    slug: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
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

      // 2. Insert Data
      const { error: dbError } = await supabase.from("debunks").insert([
        {
          title: formData.title,
          verdict: formData.verdict,
          severity: formData.severity,
          summary: formData.summary,
          slug: slugToUse,
          media_url: mediaUrl,
          // The 4 Key Fields
          platform: formData.platform,
          country: formData.country,
          source: formData.source,
          method: formData.method,
          // Default tag if needed
          tags: [formData.platform || "General"], 
        },
      ]);

      if (dbError) throw dbError;

      setMessage("Success! Case archived.");
      setFormData({ 
        title: "", verdict: "Fake", severity: "medium", summary: "", 
        platform: "", country: "", source: "", method: "", slug: "" 
      });
      setFile(null);

    } catch (error: any) {
      setMessage("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="bg-white p-8 shadow-lg rounded-xl border border-slate-200">
          <h1 className="text-2xl font-bold text-[#1e3a5f] mb-2 font-serif">Submit New Case</h1>
          <p className="text-slate-500 mb-6 text-sm">
            Enter the details below to archive a new verified deepfake.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Case Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Fabricated Disaster Footage"
                className="block w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            {/* THE 4 GRID FIELDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Platform */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Globe className="w-3 h-3" /> Platform
                </label>
                <input
                  type="text"
                  placeholder="e.g. X (Twitter)"
                  required
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                />
              </div>

              {/* Region */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Region
                </label>
                <input
                  type="text"
                  placeholder="e.g. Europe"
                  required
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>

              {/* Verified By */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified By
                </label>
                <input
                  type="text"
                  placeholder="e.g. AFP Fact Check"
                  required
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                />
              </div>

              {/* Method */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <ScanFace className="w-3 h-3" /> Method
                </label>
                <input
                  type="text"
                  placeholder="e.g. AI detection, facial analysis"
                  required
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={formData.method}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                />
              </div>
            </div>

            {/* Verdict & Severity */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Verdict</label>
                <select
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 bg-slate-50"
                  value={formData.verdict}
                  onChange={(e) => setFormData({ ...formData, verdict: e.target.value })}
                >
                  <option>Fake</option>
                  <option>Satire</option>
                  <option>Altered</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Severity</label>
                <select
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 bg-slate-50"
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                >
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Evidence Upload */}
            <div>
               <label className="block text-sm font-bold text-slate-700 mb-1">Evidence Media</label>
               <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors">
                  <input 
                      type="file" 
                      id="file-upload" 
                      className="hidden" 
                      accept="image/*,video/*"
                      onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                      <Upload className="h-8 w-8 text-slate-400 mb-2" />
                      <span className="text-sm font-medium text-[#1e3a5f]">
                          {file ? file.name : "Click to upload evidence"}
                      </span>
                  </label>
              </div>
            </div>

            {/* Summary */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Analysis / Summary</label>
              <textarea
                required
                rows={4}
                className="block w-full rounded-lg border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-[#1e3a5f] focus:outline-none"
                placeholder="Provide context about why this is fake..."
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              />
            </div>

            {/* Disclaimer Preview */}
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-xs text-yellow-800 flex gap-2">
               <span>⚠️</span>
               This content will be archived for research purposes only.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 rounded-lg bg-[#1e3a5f] py-3.5 text-white font-bold shadow hover:bg-[#162c46] transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="animate-spin h-5 w-5" />}
              {loading ? "Archiving..." : "Submit to Archive"}
            </button>

            {message && (
              <p className="text-center text-sm font-bold text-green-600 animate-in fade-in">
                {message}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}