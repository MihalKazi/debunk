import { supabase } from "@/lib/supabaseClient";
import { Calendar, ArrowLeft, ExternalLink, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { PrintButton, ShareButton } from "@/components/InteractiveActions";

// This ensures the page always fetches fresh data from Supabase
export const revalidate = 0; 

type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * SEO Metadata Generator
 * This helps Google and social media see the title and summary correctly.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: post } = await supabase
    .from("debunks")
    .select("title, summary")
    .eq("slug", slug)
    .single();

  if (!post) return { title: "GNG | Record Not Found" };

  return {
    title: `${post.title} | GNG Fact Check`,
    description: post.summary?.substring(0, 160),
    openGraph: {
      title: post.title,
      description: post.summary?.substring(0, 160),
      type: 'article',
    }
  };
}

export default async function DebunkDetail({ params }: Props) {
  const { slug } = await params;

  // Fetch the main content
  const { data: post, error } = await supabase
    .from("debunks")
    .select("*")
    .eq("slug", slug)
    .single();

  // If Supabase can't find the slug, trigger the Next.js 404 page
  if (error || !post) {
    console.error("Fetch error or missing post:", error);
    notFound();
  }

  const displayImage = post.media_url || post.image_url || post.image;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Navigation & Print Actions */}
        <div className="flex justify-between items-center mb-10">
          <Link 
            href="/" 
            className="flex items-center text-slate-500 hover:text-blue-600 font-bold text-[10px] tracking-widest uppercase transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Library
          </Link>
          
          {/* Component for window.print() logic */}
          <PrintButton />
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
              {new Date(post.occurrence_date || post.created_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
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
                <img 
                  src={displayImage} 
                  alt={post.title} 
                  className="w-full h-auto rounded-[2.2rem] object-cover" 
                />
              ) : (
                <div className="h-80 bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                  No Visual Evidence Provided
                </div>
              )}
            </div>

            {/* Main Analysis Body */}
            <article className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200 shadow-sm text-black">
              <h2 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                <ShieldCheck size={18} /> GNG Analysis
              </h2>
              <div className="prose prose-slate prose-lg max-w-none">
                <p className="text-xl text-slate-800 leading-relaxed font-serif whitespace-pre-wrap">
                  {post.summary || post.description || "No analysis provided for this entry."}
                </p>
              </div>
              
              {post.source_link && (
                <div className="mt-12 pt-8 border-t border-slate-100">
                  <a 
                    href={post.source_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline"
                  >
                    View Source Link <ExternalLink size={14} />
                  </a>
                </div>
              )}
            </article>
          </div>

          {/* Fact-Sheet Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
             <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white sticky top-24 shadow-2xl">
                <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-8 border-b border-white/10 pb-4">
                  Incident Info
                </h3>
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

                {/* Component for navigator.share() logic */}
                <ShareButton title={post.title} />
             </div>
          </aside>
        </div>
      </main>
    </div>
  );
}