"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import { 
  Loader2, Check, Trash2, Globe, Inbox, ImageIcon, 
  LogOut, X, Upload, Calendar, Search, ExternalLink, ShieldAlert, List, Edit3
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();
  
  // --- 1. STATE INITIALIZATION ---
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null); // For "Create New" form
  const [manualFile, setManualFile] = useState<File | null>(null); // For "Edit/Review" modal
  
  const [pendingScrapes, setPendingScrapes] = useState<any[]>([]);
  const [publishedDebunks, setPublishedDebunks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "published">("pending");

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewData, setReviewData] = useState<any>(null);
  const [isEditingPublished, setIsEditingPublished] = useState(false);

  const getTodayStr = () => new Date().toLocaleDateString('en-CA');

  // FORM DATA STATE (Fixed the missing definition)
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

  // --- 2. LIFECYCLE & DATA FETCHING ---
  useEffect(() => {
    fetchPending();
    fetchPublished();

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

  // --- 3. MODAL HANDLERS ---
  const openReview = (item: any) => {
    const dateObj = item.occurrence_date ? new Date(item.occurrence_date) : new Date();
    setReviewData({
      ...item,
      verdict: item.verdict || "Fake",
      severity: item.severity || "medium",
      occurrence_date: dateObj.toISOString().split('T')[0] 
    });
    setIsEditingPublished(false);
    setIsReviewOpen(true);
    setManualFile(null);
  };

  const openEditPublished = (item: any) => {
    const dateObj = item.occurrence_date ? new Date(item.occurrence_date) : new Date();
    setReviewData({ 
      ...item,
      occurrence_date: dateObj.toISOString().split('T')[0] 
    });
    setIsEditingPublished(true);
    setIsReviewOpen(true);
    setManualFile(null);
  };

  // --- 4. CORE DATABASE ACTIONS ---
  async function handleFinalSave() {
    if (!reviewData?.id && isEditingPublished) return;
    setLoading(true);
    setMessage(isEditingPublished ? "Updating archive..." : "Publishing...");
    
    try {
      let finalMediaUrl = reviewData.media_url;
      
      if (manualFile) {
        const fileExt = manualFile.name.split('.').pop();
        const fileName = `manual-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('evidence').upload(fileName, manualFile);
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage.from('evidence').getPublicUrl(fileName);
        finalMediaUrl = publicUrl;
      } 
      
      const payload = {
        title: reviewData.title,
        summary: reviewData.summary,
        verdict: reviewData.verdict,
        severity: reviewData.severity,
        platform: reviewData.platform || "Web",
        country: reviewData.country || "Global",
        media_url: finalMediaUrl,
        source_link: reviewData.source_link,
        occurrence_date: reviewData.occurrence_date,
      };

      if (isEditingPublished) {
        const { error: updateError } = await supabase
          .from("debunks")
          .update(payload)
          .eq("id", reviewData.id);
        if (updateError) throw updateError;
        setMessage("✅ Entry Updated!");
      } else {
        const slugToUse = reviewData.slug || reviewData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Math.floor(Math.random() * 1000);
        const { error: dbError } = await supabase.from("debunks").insert([{ ...payload, slug: slugToUse }]);
        if (dbError) throw dbError;
        await supabase.from("pending_scrapes").delete().eq("id", reviewData.id);
        setMessage("✅ Published!");
      }

      await fetchPublished();
      await fetchPending();
      setIsReviewOpen(false);
      setManualFile(null);
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
      const { error: dbError } = await supabase.from("debunks").insert([{ ...formData, slug: slugToUse, media_url: mediaUrl }]);
      if (dbError) throw dbError;
      
      setMessage("✅ Success! Case archived.");
      setFormData({ title: "", verdict: "Fake", severity: "medium", summary: "", platform: "", country: "", source: "GNG Archive", source_link: "", method: "AI Pattern Review", slug: "", occurrence_date: getTodayStr() });
      setFile(null);
      fetchPublished();
    } catch (error: any) { setMessage("❌ Error: " + error.message); } 
    finally { setLoading(false); setTimeout(() => setMessage(""), 3000); }
  };

  const deletePublishedRecord = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    const { error } = await supabase.from("debunks").delete().eq("id", id);
    if (!error) fetchPublished();
  };

  const filteredScrapes = pendingScrapes.filter(i => i.title?.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredPublished = publishedDebunks.filter(i => i.title?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        
        {message && (
          <div className="fixed top-24 right-6 z-[400] bg-white border-l-4 border-emerald-500 shadow-2xl p-4 rounded-xl text-black font-bold">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* CREATE FORM */}
          <div className="lg:col-span-4">
            <div className="bg-white p-8 shadow-sm rounded-2xl border border-slate-200 sticky top-8">
              <h1 className="text-xl font-bold text-[#1e3a5f] mb-6 text-black">Create Entry</h1>
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <input type="text" placeholder="Title" required className="w-full border p-2.5 rounded-lg text-black bg-white" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                <input type="url" placeholder="Source Link" className="w-full border p-2.5 rounded-lg text-black bg-white" value={formData.source_link} onChange={(e) => setFormData({ ...formData, source_link: e.target.value })} />
                <input type="date" required className="w-full border p-2.5 rounded-lg text-black bg-white" value={formData.occurrence_date} onChange={(e) => setFormData({ ...formData, occurrence_date: e.target.value })} />
                <textarea placeholder="Summary" required className="w-full border p-2.5 rounded-lg h-32 text-black bg-white" value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} />
                <input type="file" className="text-xs text-black" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
                <button type="submit" disabled={loading} className="w-full bg-[#1e3a5f] text-white py-3 rounded-lg font-bold hover:bg-black transition-colors">
                  {loading ? <Loader2 className="animate-spin mx-auto" /> : "Confirm & Publicize"}
                </button>
              </form>
            </div>
          </div>

          {/* LISTS */}
          <div className="lg:col-span-8">
            <div className="bg-white shadow-sm rounded-3xl border border-slate-200 overflow-hidden flex flex-col min-h-[700px]">
              <div className="flex border-b bg-slate-50">
                <button onClick={() => setActiveTab("pending")} className={`flex-1 py-5 text-[11px] font-black uppercase tracking-widest ${activeTab === 'pending' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>
                  Inbox ({pendingScrapes.length})
                </button>
                <button onClick={() => setActiveTab("published")} className={`flex-1 py-5 text-[11px] font-black uppercase tracking-widest ${activeTab === 'published' ? 'bg-white text-red-600 border-b-2 border-red-600' : 'text-slate-400'}`}>
                  Archive ({publishedDebunks.length})
                </button>
              </div>

              <div className="p-6 border-b">
                <div className="relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                   <input type="text" placeholder="Search archive..." className="w-full pl-11 p-3 bg-slate-100 rounded-2xl text-sm text-black outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
              </div>

              <div className="p-6 flex-1 overflow-y-auto">
                {(activeTab === "pending" ? filteredScrapes : filteredPublished).map((item) => (
                  <div key={item.id} className="p-4 bg-slate-50 rounded-2xl flex gap-4 items-center group mb-4 border border-transparent hover:border-slate-200 transition-all">
                    <div className="w-12 h-12 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                      {item.media_url && <img src={item.media_url} className="w-full h-full object-cover" alt="" />}
                    </div>
                    <div className="flex-1 truncate text-black font-bold text-sm">{item.title}</div>
                    <div className="flex gap-2">
                      {activeTab === "pending" ? (
                        <button onClick={() => openReview(item)} className="p-2 bg-white border rounded-xl text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all"><Check size={18} /></button>
                      ) : (
                        <button onClick={() => openEditPublished(item)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl"><Edit3 size={18} /></button>
                      )}
                      <button onClick={() => {
                        if(activeTab === "pending") {
                          supabase.from("pending_scrapes").delete().eq("id", item.id).then(fetchPending);
                        } else {
                          deletePublishedRecord(item.id, item.title);
                        }
                      }} className="p-2 bg-white border rounded-xl text-red-400 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {isReviewOpen && reviewData && (
        <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50 text-black">
              <h2 className="text-xl font-black uppercase tracking-tight">{isEditingPublished ? "Edit Entry" : "Review Entry"}</h2>
              <button onClick={() => setIsReviewOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X /></button>
            </div>
            
            <div className="p-8 space-y-6 text-black max-h-[70vh] overflow-y-auto">
              <input className="w-full p-4 border rounded-2xl font-bold bg-slate-50 outline-none" value={reviewData.title} onChange={(e) => setReviewData({...reviewData, title: e.target.value})} />
              
              <div className="grid grid-cols-2 gap-4">
                 <input type="date" className="w-full p-4 border rounded-2xl bg-slate-50 outline-none" value={reviewData.occurrence_date} onChange={(e) => setReviewData({...reviewData, occurrence_date: e.target.value})} />
                 <select className="w-full p-4 border rounded-2xl bg-slate-50 outline-none font-bold" value={reviewData.verdict} onChange={(e) => setReviewData({...reviewData, verdict: e.target.value})}>
                   <option value="Fake">Fake</option>
                   <option value="Misleading">Misleading</option>
                   <option value="Verified">Verified</option>
                 </select>
              </div>
              
              <textarea rows={5} className="w-full p-4 border rounded-2xl text-sm bg-slate-50 outline-none" value={reviewData.summary} onChange={(e) => setReviewData({...reviewData, summary: e.target.value})} />
              
              <div className="p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100 flex items-center gap-6">
                <div className="w-24 h-24 bg-white rounded-2xl border-2 border-white shadow-sm overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {manualFile ? <img src={URL.createObjectURL(manualFile)} className="w-full h-full object-cover" alt="" /> : (reviewData.media_url ? <img src={reviewData.media_url} className="w-full h-full object-cover" alt="" /> : <ImageIcon className="text-slate-300" size={32} />)}
                </div>
                <div>
                  <input type="file" id="edit-file" className="hidden" accept="image/*" onChange={(e) => setManualFile(e.target.files?.[0] || null)} />
                  <label htmlFor="edit-file" className="cursor-pointer text-[10px] font-black uppercase bg-white px-4 py-2.5 rounded-xl border border-blue-100 shadow-sm hover:bg-blue-600 hover:text-white transition-all">Upload New Media</label>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t flex gap-4">
              <button onClick={() => setIsReviewOpen(false)} className="flex-1 py-4 font-bold text-slate-500">Discard</button>
              <button onClick={handleFinalSave} disabled={loading} className="flex-[2] py-4 bg-[#1e3a5f] text-white font-bold rounded-2xl hover:bg-black transition-all">
                {loading ? <Loader2 className="animate-spin mx-auto" /> : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}