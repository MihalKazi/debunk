"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/Navbar";
import {
  Loader2,
  Check,
  Trash2,
  Globe,
  ImageIcon,
  X,
  Search,
  Edit3,
  ShieldCheck,
  MapPin,
  ExternalLink,
  Palette,
  Archive,
  History,
  Tag,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  // --- 1. STATE INITIALIZATION ---
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [manualFile, setManualFile] = useState<File | null>(null);
  const [pendingScrapes, setPendingScrapes] = useState<any[]>([]);
  const [publishedDebunks, setPublishedDebunks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"pending" | "published">("pending");
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewData, setReviewData] = useState<any>(null);
  const [isEditingPublished, setIsEditingPublished] = useState(false);

  const getTodayStr = () => new Date().toLocaleDateString("en-CA");
  const categories = ["Political", "Religious", "Gender", "Scam", "Others"];

  const [formData, setFormData] = useState({
    title: "",
    verdict: "Fake",
    severity: "medium",
    category: "Others",
    summary: "",
    platform: "Web",
    country: "Bangladesh",
    source: "",
    source_link: "",
    method: "AI Pattern Review",
    slug: "",
    occurrence_date: getTodayStr(),
  });

  // --- HELPER: SITE DETECTION ---
  const detectSiteName = (url: string) => {
    if (!url) return "";
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes("rumorscanner.com")) return "Rumour Scanner";
    if (lowerUrl.includes("dismislab.com")) return "Dismislab";
    if (lowerUrl.includes("fact-watch.org")) return "FactWatch";
    if (lowerUrl.includes("facebook.com")) return "Facebook";
    if (lowerUrl.includes("twitter.com") || lowerUrl.includes("x.com")) return "X (Twitter)";
    if (lowerUrl.includes("youtube.com")) return "YouTube";
    if (lowerUrl.includes("boomlive.in")) return "BOOM Live";
    return "";
  };

  // --- HELPER: SEARCH LOGIC ---
  const globalFilter = (list: any[]) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return list;

    return list.filter((item) => {
      const displaySource = item.source || detectSiteName(item.source_link) || "";
      
      const searchFields = [
        item.title,
        item.summary,
        item.category,
        item.platform,
        item.country,
        displaySource, 
        item.id?.toString(),
      ];

      return searchFields.some((field) => 
        field?.toString().toLowerCase().includes(query)
      );
    });
  };

  const filteredScrapes = useMemo(() => globalFilter(pendingScrapes), [searchQuery, pendingScrapes]);
  const filteredPublished = useMemo(() => globalFilter(publishedDebunks), [searchQuery, publishedDebunks]);

  // --- HELPER: WAYBACK MACHINE ---
  async function archiveToWayback(url: string) {
    if (!url || url.includes("localhost") || url.includes("127.0.0.1")) return null;
    try {
      const waybackUrl = `https://web.archive.org/save/${url}`;
      fetch(waybackUrl, { mode: 'no-cors' }); 
      return `https://web.archive.org/web/${url}`;
    } catch (e) {
      console.error("Wayback error:", e);
      return null;
    }
  }

  // --- HELPER: TRANSLATION ---
  async function translateToEnglish(text: string) {
    if (!text) return "";
    const isBengali = /[\u0980-\u09FF]/.test(text);
    if (!isBengali) return text;
    try {
      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=bn&tl=en&dt=t&q=${encodeURIComponent(text)}`
      );
      const data = await res.json();
      return data[0].map((s: any) => s[0]).join("");
    } catch (e) {
      return text;
    }
  }

  // --- 2. DATA FETCHING (WITH DRAFT LOGIC) ---
  useEffect(() => {
    loadData();
    const channel = supabase
      .channel("live-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "pending_scrapes" }, () => fetchPending())
      .on("postgres_changes", { event: "*", schema: "public", table: "debunks" }, () => fetchPublished())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function loadData() {
    const published = await fetchPublished();
    await fetchPending(published);
  }

  async function fetchPending(existingPublished?: any[]) {
    const { data: inbox } = await supabase.from("pending_scrapes").select("*").order("created_at", { ascending: false });
    
    // FILTER LOGIC: Remove items from Inbox if they already exist in Published
    const archivedList = existingPublished || publishedDebunks;
    const archivedTitles = new Set(archivedList.map(item => item.title.toLowerCase().trim()));
    const filteredInbox = (inbox || []).filter(item => !archivedTitles.has(item.title.toLowerCase().trim()));
    
    setPendingScrapes(filteredInbox);
    return filteredInbox;
  }

  async function fetchPublished() {
    const { data } = await supabase.from("debunks").select("*").order("occurrence_date", { ascending: false });
    const list = data || [];
    setPublishedDebunks(list);
    return list;
  }

  // --- 3. PUBLISH TOGGLE LOGIC ---
  const togglePublishStatus = async (id: string, currentStatus: boolean) => {
    setLoading(true);
    const { error } = await supabase.from("debunks").update({ is_published: !currentStatus }).eq("id", id);
    if (!error) {
      setMessage(!currentStatus ? "✅ Entry Published Live" : "🌑 Entry Moved to Drafts");
      fetchPublished();
    }
    setLoading(false);
    setTimeout(() => setMessage(""), 3000);
  };

  // --- 4. MODAL HANDLERS ---
  const openReview = async (item: any) => {
    setMessage("Translating...");
    const [tTitle, tSummary] = await Promise.all([
        translateToEnglish(item.title),
        translateToEnglish(item.summary)
    ]);
    
    // Ensure date is formatted for input type="date"
    const dateObj = item.occurrence_date ? new Date(item.occurrence_date) : new Date();
    
    setReviewData({
      ...item,
      title: tTitle,
      summary: tSummary,
      verdict: item.verdict || "Fake",
      severity: item.severity || "medium",
      category: item.category || "Others",
      platform: item.platform || "Web",
      country: item.country || "Bangladesh",
      source: item.source || detectSiteName(item.source_link) || "Verified Source",
      occurrence_date: dateObj.toISOString().split("T")[0],
    });
    setIsEditingPublished(false);
    setIsReviewOpen(true);
    setManualFile(null);
    setMessage("");
  };

  const openEditPublished = (item: any) => {
    const dateObj = item.occurrence_date ? new Date(item.occurrence_date) : new Date();
    setReviewData({
      ...item,
      occurrence_date: dateObj.toISOString().split("T")[0],
    });
    setIsEditingPublished(true);
    setIsReviewOpen(true);
    setManualFile(null);
  };

  // --- 5. CORE ACTIONS ---
  async function handleFinalSave() {
    if (!reviewData?.id && isEditingPublished) return;
    setLoading(true);
    setMessage("Syncing Evidence...");

    try {
      let finalMediaUrl = reviewData.media_url;

      if (manualFile) {
        const fileExt = manualFile.name.split(".").pop();
        const fileName = `archive-${Date.now()}.${fileExt}`;
        await supabase.storage.from("evidence").upload(fileName, manualFile, { upsert: true });
        finalMediaUrl = supabase.storage.from("evidence").getPublicUrl(fileName).data.publicUrl;
      }

      const waybackPromise = archiveToWayback(reviewData.source_link);

      const payload = {
        title: reviewData.title,
        summary: reviewData.summary,
        verdict: reviewData.verdict,
        severity: reviewData.severity,
        category: reviewData.category,
        platform: reviewData.platform,
        country: reviewData.country,
        source: reviewData.source,
        media_url: finalMediaUrl,
        source_link: reviewData.source_link,
        occurrence_date: reviewData.occurrence_date,
        is_permanently_stored: true,
        archived_at: new Date().toISOString()
      };

      let recordId = reviewData.id;

      if (isEditingPublished) {
        await supabase.from("debunks").update(payload).eq("id", reviewData.id);
        setMessage("✅ Updated!");
      } else {
        const slugToUse = reviewData.slug || reviewData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();
        // NOTE: New entries default to published
        const { data: newEntry } = await supabase.from("debunks").insert([{ ...payload, slug: slugToUse, is_published: true }]).select().single();
        if (newEntry) recordId = newEntry.id;
        await supabase.from("pending_scrapes").delete().eq("id", reviewData.id);
        setMessage("✅ Permanently Archived!");
      }

      waybackPromise.then(url => {
          if (url) supabase.from("debunks").update({ wayback_url: url }).eq("id", recordId).then(() => fetchPublished());
      });

      const updatedPublished = await fetchPublished();
      fetchPending(updatedPublished); // Re-run filter
      setIsReviewOpen(false);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // DUPLICATE CHECK
    const isDuplicate = publishedDebunks.some(d => d.title.toLowerCase().trim() === formData.title.toLowerCase().trim());
    if(isDuplicate) { 
        alert("This record already exists in the archive!"); 
        return; 
    }

    setLoading(true);
    setMessage("Storing Evidence...");
    try {
      let mediaUrl = null;
      if (file) {
        const fileName = `manual-${Date.now()}-${file.name}`;
        await supabase.storage.from("evidence").upload(fileName, file, { upsert: true });
        mediaUrl = supabase.storage.from("evidence").getPublicUrl(fileName).data.publicUrl;
      }

      const waybackPromise = archiveToWayback(formData.source_link);
      const slugToUse = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Math.floor(Math.random() * 100);
      
      const { data: newEntry, error: dbError } = await supabase.from("debunks").insert([{ 
        ...formData, 
        slug: slugToUse, 
        media_url: mediaUrl,
        is_permanently_stored: true,
        is_published: true, // Default to true for manual creation
        archived_at: new Date().toISOString()
      }]).select().single();
      
      if (dbError) throw dbError;

      waybackPromise.then(url => {
        if (url && newEntry) supabase.from("debunks").update({ wayback_url: url }).eq("id", newEntry.id).then(() => fetchPublished());
      });

      setMessage("✅ Success! Archiving in background.");
      setFormData({
        title: "", verdict: "Fake", severity: "medium", category: "Others", summary: "", platform: "Web", country: "Bangladesh",
        source: "", source_link: "", method: "AI Pattern Review", slug: "", occurrence_date: getTodayStr(),
      });
      setFile(null);
      const updatedPublished = await fetchPublished();
      fetchPending(updatedPublished);
    } catch (error: any) {
      setMessage("❌ Error: " + error.message);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const deletePublishedRecord = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("debunks").delete().eq("id", id);
    if (!error) {
        const updatedPublished = await fetchPublished();
        fetchPending(updatedPublished);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="max-w-[1400px] mx-auto px-6 py-12">
        {message && (
          <div className="fixed top-24 right-6 z-[400] bg-white border-l-4 border-emerald-500 shadow-2xl p-4 rounded-xl text-black font-bold animate-in slide-in-from-right flex items-center gap-3">
            <Archive size={20} className="text-emerald-500"/> {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* CREATE FORM */}
          <div className="lg:col-span-4">
            <div className="bg-white p-8 shadow-sm rounded-[2rem] border border-slate-200 sticky top-8">
              <h1 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <Edit3 size={20} className="text-blue-600" /> Create Entry
              </h1>
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <input type="text" placeholder="Title" required className="w-full border p-3 rounded-xl text-black bg-slate-50 font-bold outline-none focus:border-blue-500" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="Platform" className="w-full border p-3 rounded-xl text-xs text-black bg-slate-50 font-bold outline-none" value={formData.platform} onChange={(e) => setFormData({ ...formData, platform: e.target.value })} />
                  <input type="text" placeholder="Region" className="w-full border p-3 rounded-xl text-xs text-black bg-slate-50 font-bold outline-none" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
                </div>

                <div className="relative">
                  <input type="text" placeholder="Verified By" className="w-full border p-3 pl-10 rounded-xl text-xs text-blue-600 bg-slate-50 font-black uppercase tracking-wider outline-none" value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })} />
                  <ShieldCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                </div>

                <div className="relative">
                  <input type="url" placeholder="Source Link" className="w-full border p-3 rounded-xl text-xs text-black bg-slate-50 outline-none" value={formData.source_link} onChange={(e) => {
                    const url = e.target.value;
                    const detected = detectSiteName(url);
                    setFormData({ ...formData, source_link: url, source: detected || formData.source });
                  }} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input type="date" required className="w-full border p-3 rounded-xl text-xs text-black bg-slate-50 font-bold outline-none" value={formData.occurrence_date} onChange={(e) => setFormData({ ...formData, occurrence_date: e.target.value })} />
                  <select className="w-full border p-3 rounded-xl text-xs text-black bg-slate-50 font-bold outline-none" value={formData.verdict} onChange={(e) => setFormData({ ...formData, verdict: e.target.value })}>
                    <option value="Fake">Fake</option>
                    <option value="Misleading">Misleading</option>
                    <option value="Verified">Verified</option>
                  </select>
                </div>

                <div className="relative">
                  <select 
                    className="w-full border p-3 pl-10 rounded-xl text-xs text-black bg-slate-50 font-bold outline-none appearance-none" 
                    value={formData.category} 
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>

                <textarea placeholder="Summary" required className="w-full border p-3 rounded-xl h-28 text-sm text-black bg-slate-50 outline-none" value={formData.summary} onChange={(e) => setFormData({ ...formData, summary: e.target.value })} />
                
                <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center group hover:border-blue-400 transition-colors">
                  <input type="file" id="manual-file" className="hidden" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
                  <label htmlFor="manual-file" className="cursor-pointer text-[10px] font-black uppercase text-slate-500 group-hover:text-blue-600 flex flex-col items-center gap-2">
                    <ImageIcon size={20} />
                    {file ? file.name : "Upload Evidence Snapshot"}
                  </label>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-emerald-600 transition-all shadow-lg active:scale-95">
                  {loading ? <Loader2 className="animate-spin mx-auto" /> : "Archive Permanently"}
                </button>
              </form>
            </div>
          </div>

          {/* LISTS */}
          <div className="lg:col-span-8">
            <div className="bg-white shadow-sm rounded-3xl border border-slate-200 overflow-hidden flex flex-col min-h-[700px]">
              <div className="flex border-b bg-slate-50">
                <button onClick={() => setActiveTab("pending")} className={`flex-1 py-5 text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === "pending" ? "bg-white text-blue-600 border-b-2 border-blue-600" : "text-slate-400"}`}>
                  Inbox ({pendingScrapes.length})
                </button>
                <button onClick={() => setActiveTab("published")} className={`flex-1 py-5 text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === "published" ? "bg-white text-emerald-600 border-b-2 border-emerald-600" : "text-slate-400"}`}>
                  Archive ({publishedDebunks.length})
                </button>
              </div>
              <div className="p-6 border-b">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input type="text" placeholder="Search Title, Summary, Category, or Source..." className="w-full pl-11 p-3 bg-slate-100 rounded-2xl text-sm text-black outline-none border border-transparent focus:border-blue-300 transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
              </div>
              <div className="p-6 flex-1 overflow-y-auto">
                {(activeTab === "pending" ? filteredScrapes : filteredPublished).map((item) => (
                  <div key={item.id} className="p-4 bg-slate-50 rounded-2xl flex gap-4 items-center group mb-4 border border-transparent hover:border-slate-200 transition-all">
                    <div className="w-12 h-12 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0 border border-slate-300">
                      {item.media_url && <img src={item.media_url} className="w-full h-full object-cover" alt="" />}
                    </div>
                    <div className="flex-1 truncate">
                      <div className="text-black font-bold text-sm truncate">{item.title}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                        <Globe size={10} /> {item.platform || "Web"} • <span className="text-blue-600 font-black">{item.source || detectSiteName(item.source_link) || "UNVERIFIED"}</span>
                        {item.category && <span className="ml-2 px-2 py-0.5 bg-slate-200 rounded text-slate-600">{item.category}</span>}
                        {item.wayback_url && <span className="ml-2 text-emerald-500 flex items-center gap-1 font-black"><History size={10}/> Mirrored</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => router.push(`/admin/generate?id=${item.id}`)} 
                        className={`p-2 rounded-xl transition-all shadow-sm ${activeTab === 'pending' ? 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}
                      >
                        <Palette size={18} />
                      </button>

                      {/* NEW: Toggle Publish Status */}
                      {activeTab === "published" && (
                         <button 
                            onClick={() => togglePublishStatus(item.id, item.is_published !== false)} 
                            className={`p-2 border rounded-xl shadow-sm transition-all ${item.is_published !== false ? 'bg-white text-slate-600 hover:bg-slate-100' : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'}`}
                            title={item.is_published !== false ? "Published (Click to Draft)" : "Draft (Click to Publish)"}
                         >
                           {item.is_published !== false ? <Eye size={18} /> : <EyeOff size={18} />}
                         </button>
                      )}

                      {activeTab === "pending" ? (
                        <button onClick={() => openReview(item)} className="p-2 bg-white border rounded-xl text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"><Check size={18} /></button>
                      ) : (
                        <button onClick={() => openEditPublished(item)} className="p-2 text-blue-500 bg-white border hover:bg-blue-50 rounded-xl shadow-sm"><Edit3 size={18} /></button>
                      )}
                      <button onClick={() => {
                        if (activeTab === "pending") {
                          supabase.from("pending_scrapes").delete().eq("id", item.id).then(() => fetchPending(publishedDebunks));
                        } else {
                          deletePublishedRecord(item.id, item.title);
                        }
                      }} className="p-2 bg-white border rounded-xl text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
                {(activeTab === "pending" ? filteredScrapes : filteredPublished).length === 0 && (
                  <div className="text-center py-20 text-slate-400 font-bold text-sm">No records found matching your search.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* REVIEW MODAL (FULL FEATURES RESTORED) */}
      {isReviewOpen && reviewData && (
        <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b flex justify-between items-center bg-white text-black">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{isEditingPublished ? "Update Archive" : "Finalize Evidence"}</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mt-1">Creating Permanent Forensic Record</p>
              </div>
              <button onClick={() => setIsReviewOpen(false)} className="p-3 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
            </div>

            <div className="p-8 space-y-6 text-black max-h-[75vh] overflow-y-auto bg-slate-50/50">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Archive Headline</label>
                <input className="w-full p-4 border border-slate-200 rounded-2xl font-bold bg-white text-lg outline-none focus:ring-2 ring-blue-500/20" value={reviewData.title} onChange={(e) => setReviewData({ ...reviewData, title: e.target.value })} />
              </div>

              {/* RESTORED: Detailed Metadata Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Platform</label>
                  <input className="w-full p-4 border border-slate-200 rounded-2xl bg-white outline-none font-bold text-sm" value={reviewData.platform} onChange={(e) => setReviewData({ ...reviewData, platform: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Region</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input className="w-full p-4 pl-10 border border-slate-200 rounded-2xl bg-white outline-none font-bold text-sm" value={reviewData.country} onChange={(e) => setReviewData({ ...reviewData, country: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Verified By</label>
                  <div className="relative">
                    <ShieldCheck size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                    <input className="w-full p-4 pl-10 border border-slate-200 rounded-2xl bg-white outline-none font-bold text-sm text-blue-600" value={reviewData.source} onChange={(e) => setReviewData({ ...reviewData, source: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* RESTORED: Category, Verdict, Severity, Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Category</label>
                  <select 
                    className="w-full p-4 border border-slate-200 rounded-2xl bg-white outline-none font-bold text-sm" 
                    value={reviewData.category} 
                    onChange={(e) => setReviewData({ ...reviewData, category: e.target.value })}
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Incident Date</label>
                  <input type="date" className="w-full p-4 border border-slate-200 rounded-2xl bg-white outline-none font-bold" value={reviewData.occurrence_date} onChange={(e) => setReviewData({ ...reviewData, occurrence_date: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Verdict</label>
                  <select 
                    className="w-full p-4 border border-slate-200 rounded-2xl bg-white outline-none font-bold text-sm" 
                    value={reviewData.verdict} 
                    onChange={(e) => setReviewData({ ...reviewData, verdict: e.target.value })}
                  >
                    <option value="Fake">Fake</option>
                    <option value="Misleading">Misleading</option>
                    <option value="Verified">Verified</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Severity</label>
                  <select 
                    className="w-full p-4 border border-slate-200 rounded-2xl bg-white outline-none font-bold text-sm" 
                    value={reviewData.severity} 
                    onChange={(e) => setReviewData({ ...reviewData, severity: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Original URL (Source)</label>
                <div className="relative">
                  <ExternalLink size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input className="w-full p-4 pl-10 border border-slate-200 rounded-2xl bg-white outline-none text-xs text-slate-500" value={reviewData.source_link} onChange={(e) => setReviewData({ ...reviewData, source_link: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Evidence Analysis Summary</label>
                <textarea rows={4} className="w-full p-4 border border-slate-200 rounded-2xl text-base bg-white outline-none leading-relaxed" value={reviewData.summary} onChange={(e) => setReviewData({ ...reviewData, summary: e.target.value })} />
              </div>

              {/* RESTORED: Image Preview & Upload */}
              <div className="p-6 bg-[#0f172a] rounded-[2rem] border border-slate-800 flex items-center justify-between gap-6 shadow-xl">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-white rounded-2xl border-2 border-white/10 shadow-sm overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {manualFile ? (
                      <img src={URL.createObjectURL(manualFile)} className="w-full h-full object-cover" alt="" />
                    ) : reviewData.media_url ? (
                      <img src={reviewData.media_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <ImageIcon className="text-slate-200" size={32} />
                    )}
                  </div>
                  <div className="text-white">
                    <p className="font-bold text-sm">Persistent Evidence</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Stored in GNG Infrastructure</p>
                  </div>
                </div>
                <input type="file" id="edit-file" className="hidden" accept="image/*" onChange={(e) => setManualFile(e.target.files?.[0] || null)} />
                <label htmlFor="edit-file" className="cursor-pointer text-[10px] font-black uppercase bg-white text-slate-900 px-6 py-3 rounded-xl shadow-lg hover:bg-blue-500 hover:text-white transition-all">Capture Snapshot</label>
              </div>
            </div>

            <div className="p-8 bg-white border-t flex flex-wrap gap-4">
              <button onClick={() => setIsReviewOpen(false)} className="px-6 py-4 font-black uppercase text-[10px] tracking-[0.2em] text-slate-400 hover:text-red-500 transition-colors">Discard changes</button>
              
              <button 
                onClick={() => router.push(`/admin/generate?id=${reviewData.id}`)}
                className="px-6 py-4 bg-blue-50 text-blue-600 border border-blue-100 font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2"
              >
                <Palette size={14} /> Design View
              </button>

              <button onClick={handleFinalSave} disabled={loading} className="flex-1 py-5 bg-emerald-600 text-white font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl hover:bg-slate-900 transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-3">
                {loading ? <Loader2 className="animate-spin" /> : <><Archive size={16}/> {isEditingPublished ? "Update Archive" : "Seal & Mirror"}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}