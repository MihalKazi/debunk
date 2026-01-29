"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import { 
  Loader2, Check, Trash2, Globe, Inbox, ImageIcon, 
  LogOut, X, Upload, Calendar, Search, ExternalLink, ShieldAlert, List
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [pendingScrapes, setPendingScrapes] = useState<any[]>([]);
  const [publishedDebunks, setPublishedDebunks] = useState<any[]>([]); // NEW: State for live news
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "published">("pending"); // NEW: Tab state

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewData, setReviewData] = useState<any>(null);
  const [manualFile, setManualFile] = useState<File | null>(null);

  // Helper to get today's date in YYYY-MM-DD format
  const getTodayStr = () => new Date().toLocaleDateString('en-CA');

  const [formData, setFormData] = useState({
    title: "",
    verdict: "Fake",
    severity: "medium",
    summary: "",
    platform: "",
    country: "",
    source: "GNG Archive",
    source_link: "",
    method: "AI Pattern Review",
    slug: "",
    occurrence_date: getTodayStr(), 
  });

  useEffect(() => {
    fetchPending();
    fetchPublished(); // Fetch live news on load

    const channel = supabase
      .channel('live-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pending_scrapes' }, () => fetchPending())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'debunks' }, () => fetchPublished())
      .subscribe();
      
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchPending() {
    const { data } = await supabase.from("pending_scrapes").select("*").order("created_at", { ascending: false }); 
    setPendingScrapes(data || []);
  }

  async function fetchPublished() {
    const { data } = await supabase.from("debunks").select("*").order("occurrence_date", { ascending: false });
    setPublishedDebunks(data || []);
  }

  // --- NEW: DELETE FUNCTION FOR PUBLISHED NEWS ---
  async function deletePublishedRecord(id: string, title: string) {
    const confirmed = window.confirm(`⚠️ PERMANENT DELETE: Are you sure you want to remove "${title}" from the live public archive? This cannot be undone.`);
    
    if (!confirmed) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("debunks").delete().eq("id", id);
      if (error) throw error;
      
      setPublishedDebunks(prev => prev.filter(item => item.id !== id));
      setMessage("🗑️ Entry removed from live archive.");
    } catch (err: any) {
      alert("Delete failed: " + err.message);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  }

  const filteredScrapes = pendingScrapes.filter((item) => {
    const query = searchQuery.toLowerCase();
    return item.title?.toLowerCase().includes(query) || item.summary?.toLowerCase().includes(query);
  });

  const filteredPublished = publishedDebunks.filter((item) => {
    const query = searchQuery.toLowerCase();
    return item.title?.toLowerCase().includes(query) || item.summary?.toLowerCase().includes(query);
  });

  const openReview = (item: any) => {
    const dateObj = item.occurrence_date ? new Date(item.occurrence_date) : new Date();
    const cleanDate = dateObj.toISOString().split('T')[0];

    setReviewData({
      ...item,
      verdict: item.verdict || "Fake",
      severity: item.severity || "medium",
      platform: item.platform || "Scraped Content",
      country: item.country || "Global",
      source_link: item.source_link || "",
      occurrence_date: cleanDate 
    });
    setManualFile(null);
    setIsReviewOpen(true);
  };

  async function handleFinalApprove() {
    setLoading(true);
    setMessage("Finalizing archive entry...");
    try {
      let finalMediaUrl = reviewData.media_url;
      if (manualFile) {
        const fileName = `manual-${Date.now()}.${manualFile.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage.from('evidence').upload(fileName, manualFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('evidence').getPublicUrl(fileName);
        finalMediaUrl = publicUrl;
      } 
      
      const slugToUse = reviewData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Math.floor(Math.random() * 1000);
      
      const { error: dbError } = await supabase.from("debunks").insert([{
        title: reviewData.title,
        summary: reviewData.summary,
        verdict: reviewData.verdict,
        severity: reviewData.severity,
        platform: reviewData.platform,
        country: reviewData.country,
        media_url: finalMediaUrl,
        source_link: reviewData.source_link,
        slug: slugToUse,
        occurrence_date: reviewData.occurrence_date,
        tags: ["scraped", reviewData.verdict]
      }]);

      if (dbError) throw dbError;
      await supabase.from("pending_scrapes").delete().eq("id", reviewData.id);
      setIsReviewOpen(false);
      setMessage("✅ Published Successfully!");
    } catch (err: any) { 
      alert("Error: " + err.message); 
    } finally { 
      setLoading(false); 
      setTimeout(() => setMessage(""), 3000); 
    }
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let mediaUrl = null;
      if (file) {
        const fileName = `${Date.now()}-${file.name}`;
        await supabase.storage.from('evidence').upload(fileName, file);
        const { data: { publicUrl } } = supabase.storage.from('evidence').getPublicUrl(fileName);
        mediaUrl = publicUrl;
      }
      
      const slugToUse = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Math.floor(Math.random() * 100);
      
      const { error: dbError } = await supabase.from("debunks").insert([{ 
        ...formData, 
        slug: slugToUse, 
        media_url: mediaUrl,
        tags: ["manual", formData.verdict]
      }]);

      if (dbError) throw dbError;
      setMessage("✅ Success! Case archived.");
      setFormData({ 
        title: "", verdict: "Fake", severity: "medium", 
        summary: "", platform: "", country: "", 
        source: "GNG Archive", source_link: "", method: "AI Pattern Review", 
        slug: "", occurrence_date: getTodayStr() 
      });
      setFile(null);
    } catch (error: any) { 
      setMessage("❌ Error: " + error.message); 
    } finally { 
      setLoading(false); 
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleLogout = () => {
    document.cookie = "admin_access=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        {message && (
          <div className="fixed top-24 right-6 z-[400] bg-white border-l-4 border-emerald-500 shadow-2xl p-4 rounded-xl animate-in fade-in slide-in-from-right-4">
            <p className="font-bold text-sm text-slate-800">{message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: Manual Form */}
          <div className="lg:col-span-4">
            <div className="bg-white p-8 shadow-sm rounded-2xl border border-slate-200 sticky top-8">
              <h1 className="text-xl font-bold text-[#1e3a5f] font-serif mb-6">Create Archive Entry</h1>
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <input type="text" placeholder="Title" required className="w-full border p-2.5 rounded-lg text-black" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                <div className="relative">
                  <Globe className="absolute left-3 top-3 text-slate-400" size={16} />
                  <input type="url" placeholder="Source News Link" className="w-full border p-2.5 pl-10 rounded-lg text-black" value={formData.source_link} onChange={(e) => setFormData({ ...formData, source_link: e.target.value })} />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 text-slate-400" size={16} />
                  <input type="date" required className="w-full border p-2.5 pl-10 rounded-lg text-black" value={formData.occurrence_date} onChange={(e) => setFormData({ ...formData, occurrence_date: e.target.value })} />
                </div>
                <textarea placeholder="Summary" required className="w-full border p-2.5 rounded-lg h-32 text-black" value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} />
                <div className="border-2 border-dashed p-4 rounded-lg bg-slate-50 text-center">
                  <input type="file" className="text-xs" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-[#1e3a5f] text-white py-3 rounded-lg font-bold hover:bg-black transition-all">
                  {loading ? <Loader2 className="animate-spin mx-auto" /> : "Confirm & Publicize"}
                </button>
              </form>
              <button onClick={handleLogout} className="mt-6 text-[10px] text-slate-400 uppercase font-bold hover:text-red-500 underline flex items-center gap-1">
                <LogOut size={12} /> Logout
              </button>
            </div>
          </div>

          {/* RIGHT: Management Tabs */}
          <div className="lg:col-span-8">
            <div className="bg-white shadow-sm rounded-3xl border border-slate-200 overflow-hidden min-h-[700px] flex flex-col">
              
              {/* Tab Header */}
              <div className="flex border-b bg-slate-50/50">
                <button 
                  onClick={() => setActiveTab("pending")}
                  className={`flex-1 py-5 flex items-center justify-center gap-2 font-black text-[11px] uppercase tracking-widest transition-all ${activeTab === 'pending' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:bg-white/50'}`}
                >
                  <Inbox size={16} /> Scraper Inbox ({pendingScrapes.length})
                </button>
                <button 
                  onClick={() => setActiveTab("published")}
                  className={`flex-1 py-5 flex items-center justify-center gap-2 font-black text-[11px] uppercase tracking-widest transition-all ${activeTab === 'published' ? 'bg-white text-red-600 border-b-2 border-red-600' : 'text-slate-400 hover:bg-white/50'}`}
                >
                  <List size={16} /> Live Archive ({publishedDebunks.length})
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-6 border-b">
                <div className="relative">
                  <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder={activeTab === 'pending' ? "Search inbox..." : "Search live archive to delete items..."}
                    className="w-full pl-12 pr-4 py-3 bg-slate-100 border-none rounded-2xl text-sm text-black focus:ring-2 ring-blue-500/20"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6 flex-1 overflow-y-auto max-h-[800px]">
                {activeTab === "pending" ? (
                  <div className="space-y-4">
                    {filteredScrapes.length === 0 ? <p className="text-center py-20 text-slate-400 italic">Inbox is empty.</p> : filteredScrapes.map((item) => (
                      <div key={item.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex gap-4 items-center group">
                        <div className="w-16 h-16 bg-slate-200 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border">
                          {item.media_url ? <img src={item.media_url} className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-400" size={20} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 text-sm truncate">{item.title}</h4>
                          <p className="text-[11px] text-slate-500 line-clamp-1 italic">{item.summary}</p>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openReview(item)} className="p-2.5 bg-white text-emerald-600 border border-slate-200 rounded-xl hover:bg-emerald-600 hover:text-white shadow-sm"><Check size={20} /></button>
                          <button onClick={() => {if(confirm('Discard this scrape?')) supabase.from("pending_scrapes").delete().eq("id", item.id).then(fetchPending)}} className="p-2.5 bg-white text-red-400 border border-slate-200 rounded-xl hover:bg-red-500 hover:text-white shadow-sm"><Trash2 size={20} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="mb-4 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3 items-start">
                      <ShieldAlert className="text-amber-600 flex-shrink-0" size={20} />
                      <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
                        <strong>Public Archive Management:</strong> Deleting items here will remove them from the public website timeline and trend chart immediately.
                      </p>
                    </div>
                    {filteredPublished.length === 0 ? <p className="text-center py-20 text-slate-400 italic">No published items found.</p> : filteredPublished.map((item) => (
                      <div key={item.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex gap-4 items-center group hover:border-red-100 hover:bg-red-50/20 transition-all">
                        <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {item.media_url ? <img src={item.media_url} className="w-full h-full object-cover opacity-80" /> : <ImageIcon className="text-slate-300" size={20} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-800 text-sm truncate">{item.title}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-slate-100 rounded text-slate-500">{item.verdict}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{item.occurrence_date}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/debunk/${item.slug}`} target="_blank" className="p-2.5 text-slate-400 hover:text-blue-600"><ExternalLink size={18} /></Link>
                          <button 
                            onClick={() => deletePublishedRecord(item.id, item.title)} 
                            className="p-2.5 bg-white text-red-400 border border-slate-200 rounded-xl hover:bg-red-500 hover:text-white shadow-sm transition-all"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal - (Keep your existing modal code exactly as it was) */}
      {isReviewOpen && reviewData && (
        <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-black text-[#1e3a5f] uppercase">Review Case</h2>
              <button onClick={() => setIsReviewOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20}/></button>
            </div>
            <div className="p-8 overflow-y-auto space-y-6 text-black">
              <input className="w-full p-3 border rounded-xl font-bold bg-white" value={reviewData.title} onChange={(e) => setReviewData({...reviewData, title: e.target.value})} />
              <input type="date" className="w-full p-3 border rounded-xl bg-white" value={reviewData.occurrence_date} onChange={(e) => setReviewData({...reviewData, occurrence_date: e.target.value})} />
              <textarea rows={4} className="w-full p-3 border rounded-xl text-sm bg-white" value={reviewData.summary} onChange={(e) => setReviewData({...reviewData, summary: e.target.value})} />
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-4">
                <div className="w-20 h-20 bg-white rounded-lg border overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {manualFile || reviewData.media_url ? <img src={manualFile ? URL.createObjectURL(manualFile) : reviewData.media_url} className="w-full h-full object-cover" /> : <ImageIcon size={24} />}
                </div>
                <input type="file" id="review-file" className="hidden" onChange={(e) => setManualFile(e.target.files?.[0] || null)} />
                <label htmlFor="review-file" className="cursor-pointer bg-white border px-4 py-2 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-600 hover:text-white transition-all">Replace Image</label>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t flex gap-3">
              <button onClick={() => setIsReviewOpen(false)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-200 rounded-2xl">Discard</button>
              <button onClick={handleFinalApprove} disabled={loading} className="flex-[2] py-4 bg-[#1e3a5f] text-white font-bold rounded-2xl hover:bg-black flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : "Publish to Live Archive"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}