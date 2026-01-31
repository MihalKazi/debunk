"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Calendar, ArrowLeft, ExternalLink, ShieldCheck, Loader2, Share2, Printer, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function DebunkDetail() {
  const params = useParams();
  const slug = params?.slug as string;

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      if (!slug) return;
      
      try {
        setLoading(true);
        // We use .select("*") to ensure we get all columns, 
        // including those we just fixed like media_url
        const { data, error } = await supabase
          .from("debunks")
          .select("*")
          .eq("slug", slug)
          .maybeSingle(); // maybeSingle prevents errors if the slug doesn't exist

        if (error) throw error;
        setPost(data);
      } catch (err) {
        console.error("Error fetching debunk detail:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [slug]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ 
          title: post?.title, 
          url: window.location.href 
        });
      } catch (err) {
        console.log('Share cancelled or failed');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Retrieving Archive...</p>
      </div>
    );
  }

  // 2. Not Found State
  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <AlertTriangle size={48} className="text-amber-500 mb-4" />
        <h1 className="text-2xl font-black text-slate-900 uppercase mb-2">Record Not Found</h1>
        <p className="text-slate-500 mb-6">The debunk you are looking for may have been moved or deleted.</p>
        <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">
          Return to Archive
        </Link>
      </div>
    );
  }

  const displayImage = post.media_url || post.image_url || post.image;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Navigation & Print Actions */}
        <div className="flex justify-between items-center mb-10">
          <Link href="/" className="flex items-center text-slate-500 hover:text-blue-600 font-bold text-[10px] tracking-widest uppercase transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Library
          </Link>
          <button 
            onClick={handlePrint}
            type="button"
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 border border-slate-200 px-4 py-2 rounded-xl bg-white transition-all shadow-sm"
          >
            <Printer size={14} /> Save Report
          </button>
        </div>

        <header className="mb-12">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-sm ${
              post.verdict?.toLowerCase() === 'fake' ? 'bg-red-500' : 
              post.verdict?.toLowerCase() === 'misleading' ? 'bg-amber-500' : 'bg-emerald-500'
            }`}>
              Verdict: {post.verdict || "Verified"}
            </span>
            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center bg-white px-3 py-1.5 rounded-full border border-slate-100">
              <Calendar className="h-3.5 w-3.5 mr-2 text-blue-500" />
              {new Date(post.occurrence_date || post.created_at).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 font-serif leading-tight mb-4 tracking-tight">
            {post.title}
          </h1>
        </header>

        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            {/* Visual Evidence Card */}
            <div className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-xl p-2">
              {displayImage ? (
                <img src={displayImage} alt={post.title} className="w-full h-auto rounded-[2.2rem]" />
              ) : (
                <div className="h-80 bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-[10px] uppercase">No Image Provided</div>
              )}
            </div>

            {/* Main Analysis */}
            <article className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-sm text-black">
              <h2 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                <ShieldCheck size={18} /> GNG Analysis
              </h2>
              <div className="prose prose-slate prose-lg max-w-none">
                <p className="text-xl text-slate-800 leading-relaxed font-serif whitespace-pre-wrap">
                  {post.summary || post.description}
                </p>
              </div>
              
              {post.source_link && (
                <div className="mt-12 pt-8 border-t border-slate-100">
                  <a href={post.source_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline">
                    View Source Link <ExternalLink size={14} />
                  </a>
                </div>
              )}
            </article>
          </div>

          {/* Fact-Sheet Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
             <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white sticky top-24 shadow-2xl">
                <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-8 border-b border-white/10 pb-4">Incident Info</h3>
                <div className="space-y-8">
                   <div>
                      <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-2">Region</p>
                      <p className="font-serif text-xl">{post.country || "Global"}</p>
                   </div>
                   <div>
                      <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-2">Platform</p>
                      <p className="font-serif text-xl">{post.platform || "Web"}</p>
                   </div>
                   {post.severity && (
                     <div>
                        <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-2">Severity</p>
                        <p className="font-serif text-xl capitalize">{post.severity}</p>
                     </div>
                   )}
                </div>

                <button 
                  onClick={handleShare}
                  type="button"
                  className="w-full mt-10 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all active:scale-95 shadow-lg"
                >
                  <Share2 size={18} /> Share Truth
                </button>
             </div>
          </aside>
        </div>
      </main>
    </div>
  );
}